package com.tripzy.service;

import com.tripzy.dto.GroupDtos.*;
import com.tripzy.entity.*;
import com.tripzy.exception.BadRequestException;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.exception.UnauthorizedException;
import com.tripzy.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroupService {

    private final TravelGroupRepository groupRepository;
    private final GroupMessageRepository messageRepository;
    private final GroupAnnouncementRepository announcementRepository;
    private final GroupPollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final TripParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public GroupService(TravelGroupRepository groupRepository,
                        GroupMessageRepository messageRepository,
                        GroupAnnouncementRepository announcementRepository,
                        GroupPollRepository pollRepository,
                        PollOptionRepository pollOptionRepository,
                        PollVoteRepository pollVoteRepository,
                        TripParticipantRepository participantRepository,
                        UserRepository userRepository,
                        SimpMessagingTemplate messagingTemplate) {
        this.groupRepository = groupRepository;
        this.messageRepository = messageRepository;
        this.announcementRepository = announcementRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.pollVoteRepository = pollVoteRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public TravelGroup getGroupById(Long userId, Long groupId) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));

        verifyMembership(userId, group.getTripId());
        return group;
    }

    public TravelGroup getGroupByTripId(Long userId, Long tripId) {
        verifyMembership(userId, tripId);
        return groupRepository.findByTripId(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("No travel group found for trip: " + tripId));
    }

    public List<TripParticipant> getGroupMembers(Long userId, Long groupId) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());
        return participantRepository.findByTripId(group.getTripId());
    }

    @Transactional
    public GroupMessage sendMessage(Long userId, Long groupId, SendMessageRequest request) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        GroupMessage msg = new GroupMessage(
                groupId,
                user.getId(),
                user.getFullName(),
                user.getAvatarUrl(),
                request.getContent(),
                request.getMessageType() != null ? request.getMessageType() : "TEXT"
        );
        GroupMessage saved = messageRepository.save(msg);

        // Broadcast to WebSocket subscribers
        try {
            messagingTemplate.convertAndSend("/topic/group/" + groupId + "/messages", saved);
        } catch (Exception ignored) {}

        return saved;
    }

    public List<GroupMessage> getMessages(Long userId, Long groupId) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());
        return messageRepository.findByGroupIdOrderByCreatedAtAsc(groupId);
    }

    @Transactional
    public GroupAnnouncement createAnnouncement(Long userId, Long groupId, CreateAnnouncementRequest request) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        GroupAnnouncement announcement = new GroupAnnouncement();
        announcement.setGroupId(groupId);
        announcement.setAuthorId(user.getId());
        announcement.setAuthorName(user.getFullName());
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setPriority(request.getPriority());
        announcement.setCreatedAt(LocalDateTime.now());

        return announcementRepository.save(announcement);
    }

    public List<GroupAnnouncement> getAnnouncements(Long userId, Long groupId) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());
        return announcementRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    @Transactional
    public Map<String, Object> createPoll(Long userId, Long groupId, CreatePollRequest request) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("Poll must have at least 2 options");
        }

        GroupPoll poll = new GroupPoll();
        poll.setGroupId(groupId);
        poll.setCreatorId(user.getId());
        poll.setCreatorName(user.getFullName());
        poll.setQuestion(request.getQuestion());
        poll.setCreatedAt(LocalDateTime.now());
        GroupPoll savedPoll = pollRepository.save(poll);

        List<PollOption> savedOptions = new ArrayList<>();
        for (String optText : request.getOptions()) {
            if (optText != null && !optText.isBlank()) {
                PollOption opt = new PollOption(savedPoll.getId(), optText.trim());
                savedOptions.add(pollOptionRepository.save(opt));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("poll", savedPoll);
        result.put("options", savedOptions);
        return result;
    }

    @Transactional
    public Map<String, Object> votePoll(Long userId, Long pollId, Long optionId) {
        GroupPoll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        TravelGroup group = groupRepository.findById(poll.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());

        if (Boolean.TRUE.equals(poll.getIsClosed())) {
            throw new BadRequestException("This poll is closed");
        }

        if (pollVoteRepository.existsByPollIdAndUserId(pollId, userId)) {
            throw new BadRequestException("You have already voted in this poll");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll option not found"));

        if (!option.getPollId().equals(pollId)) {
            throw new BadRequestException("Option does not belong to this poll");
        }

        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);

        PollVote vote = new PollVote(pollId, optionId, userId);
        pollVoteRepository.save(vote);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("options", pollOptionRepository.findByPollId(pollId));
        return res;
    }

    public List<Map<String, Object>> getPolls(Long userId, Long groupId) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        verifyMembership(userId, group.getTripId());

        List<GroupPoll> polls = pollRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
        List<Map<String, Object>> resList = new ArrayList<>();

        for (GroupPoll poll : polls) {
            Map<String, Object> item = new HashMap<>();
            item.put("poll", poll);
            item.put("options", pollOptionRepository.findByPollId(poll.getId()));
            item.put("hasVoted", pollVoteRepository.existsByPollIdAndUserId(poll.getId(), userId));
            resList.add(item);
        }

        return resList;
    }

    public void verifyMembership(Long userId, Long tripId) {
        if (!participantRepository.existsByTripIdAndUserId(tripId, userId)) {
            throw new UnauthorizedException("You are not an authorized member of this travel group");
        }
    }
}
