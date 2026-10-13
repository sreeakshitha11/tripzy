package com.tripzy.controller;

import com.tripzy.dto.GroupDtos.*;
import com.tripzy.entity.*;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<TravelGroup> getGroup(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(principal.getId(), id));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<TravelGroup> getGroupByTrip(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long tripId) {
        return ResponseEntity.ok(groupService.getGroupByTripId(principal.getId(), tripId));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<TripParticipant>> getMembers(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupMembers(principal.getId(), id));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<GroupMessage>> getMessages(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getMessages(principal.getId(), id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<GroupMessage> sendMessage(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable Long id,
                                                    @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(groupService.sendMessage(principal.getId(), id, request));
    }

    @GetMapping("/{id}/announcements")
    public ResponseEntity<List<GroupAnnouncement>> getAnnouncements(@AuthenticationPrincipal UserPrincipal principal,
                                                                    @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getAnnouncements(principal.getId(), id));
    }

    @PostMapping("/{id}/announcements")
    public ResponseEntity<GroupAnnouncement> createAnnouncement(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable Long id,
                                                                @Valid @RequestBody CreateAnnouncementRequest request) {
        return ResponseEntity.ok(groupService.createAnnouncement(principal.getId(), id, request));
    }

    @GetMapping("/{id}/polls")
    public ResponseEntity<List<Map<String, Object>>> getPolls(@AuthenticationPrincipal UserPrincipal principal,
                                                              @PathVariable Long id) {
        return ResponseEntity.ok(groupService.getPolls(principal.getId(), id));
    }

    @PostMapping("/{id}/polls")
    public ResponseEntity<Map<String, Object>> createPoll(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long id,
                                                          @Valid @RequestBody CreatePollRequest request) {
        return ResponseEntity.ok(groupService.createPoll(principal.getId(), id, request));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<Map<String, Object>> votePoll(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable Long pollId,
                                                        @RequestBody VotePollRequest request) {
        return ResponseEntity.ok(groupService.votePoll(principal.getId(), pollId, request.getOptionId()));
    }
}
