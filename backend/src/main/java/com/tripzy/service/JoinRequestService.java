package com.tripzy.service;

import com.tripzy.entity.*;
import com.tripzy.exception.BadRequestException;
import com.tripzy.exception.CapacityExceededException;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.exception.UnauthorizedException;
import com.tripzy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final TripRepository tripRepository;
    private final TripParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final TravelGroupRepository groupRepository;
    private final GroupMessageRepository messageRepository;

    public JoinRequestService(JoinRequestRepository joinRequestRepository,
                              TripRepository tripRepository,
                              TripParticipantRepository participantRepository,
                              UserRepository userRepository,
                              NotificationRepository notificationRepository,
                              TravelGroupRepository groupRepository,
                              GroupMessageRepository messageRepository) {
        this.joinRequestRepository = joinRequestRepository;
        this.tripRepository = tripRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.groupRepository = groupRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public JoinRequest submitJoinRequest(Long userId, Long tripId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (trip.getOrganizerId().equals(userId)) {
            throw new BadRequestException("You are the organizer of this trip");
        }

        if (!"UPCOMING".equalsIgnoreCase(trip.getStatus())) {
            throw new BadRequestException("This trip is no longer open for joining");
        }

        if (participantRepository.existsByTripIdAndUserId(tripId, userId)) {
            throw new BadRequestException("You are already a member of this trip");
        }

        if (joinRequestRepository.existsByTripIdAndApplicantIdAndStatus(tripId, userId, "PENDING")) {
            throw new BadRequestException("You already have a pending join request for this trip");
        }

        if (trip.getCurrentParticipants() >= trip.getMaxParticipants()) {
            throw new CapacityExceededException("This trip is already full. No remaining spots.");
        }

        JoinRequest request = new JoinRequest();
        request.setTripId(trip.getId());
        request.setTripTitle(trip.getTitle());
        request.setApplicantId(user.getId());
        request.setApplicantName(user.getFullName());
        request.setApplicantAvatar(user.getAvatarUrl());
        request.setApplicantBio(user.getBio());
        request.setMessage(message != null ? message : "Hi! I would love to join your adventure.");
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        JoinRequest savedRequest = joinRequestRepository.save(request);

        // Notify organizer
        Notification notification = new Notification(
                trip.getOrganizerId(),
                "New Join Request",
                user.getFullName() + " requested to join '" + trip.getTitle() + "'",
                "JOIN_REQUEST",
                savedRequest.getId()
        );
        notificationRepository.save(notification);

        return savedRequest;
    }

    @Transactional
    public JoinRequest reviewJoinRequest(Long organizerId, Long requestId, String statusDecision) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found"));

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (!trip.getOrganizerId().equals(organizerId)) {
            throw new UnauthorizedException("Only the trip organizer can review this request");
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("This request has already been reviewed");
        }

        if ("ACCEPTED".equalsIgnoreCase(statusDecision)) {
            // Validate capacity
            if (trip.getCurrentParticipants() >= trip.getMaxParticipants()) {
                throw new CapacityExceededException("Cannot accept request: group capacity has been reached");
            }

            request.setStatus("ACCEPTED");
            request.setReviewedAt(LocalDateTime.now());
            joinRequestRepository.save(request);

            // Increment participant count
            trip.setCurrentParticipants(trip.getCurrentParticipants() + 1);
            tripRepository.save(trip);

            // Add participant
            TripParticipant participant = new TripParticipant(
                    trip.getId(),
                    request.getApplicantId(),
                    request.getApplicantName(),
                    request.getApplicantAvatar(),
                    "MEMBER"
            );
            participantRepository.save(participant);

            // Post welcome message in Travel Group
            groupRepository.findByTripId(trip.getId()).ifPresent(group -> {
                GroupMessage welcomeMsg = new GroupMessage(
                        group.getId(),
                        trip.getOrganizerId(),
                        "System",
                        null,
                        request.getApplicantName() + " has joined the group! Welcome aboard!",
                        "SYSTEM"
                );
                messageRepository.save(welcomeMsg);
            });

            // Notify applicant
            Notification notif = new Notification(
                    request.getApplicantId(),
                    "Request Accepted!",
                    "Your request to join '" + trip.getTitle() + "' was accepted! You are now part of the group.",
                    "REQUEST_ACCEPTED",
                    trip.getId()
            );
            notificationRepository.save(notif);

        } else if ("REJECTED".equalsIgnoreCase(statusDecision)) {
            request.setStatus("REJECTED");
            request.setReviewedAt(LocalDateTime.now());
            joinRequestRepository.save(request);

            // Notify applicant
            Notification notif = new Notification(
                    request.getApplicantId(),
                    "Request Update",
                    "Your request to join '" + trip.getTitle() + "' was not accepted at this time.",
                    "REQUEST_REJECTED",
                    trip.getId()
            );
            notificationRepository.save(notif);
        } else {
            throw new BadRequestException("Invalid status decision. Must be ACCEPTED or REJECTED");
        }

        return request;
    }

    public List<JoinRequest> getRequestsForTrip(Long organizerId, Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (!trip.getOrganizerId().equals(organizerId)) {
            throw new UnauthorizedException("Only the organizer can view join requests for this trip");
        }

        return joinRequestRepository.findByTripId(tripId);
    }
}
