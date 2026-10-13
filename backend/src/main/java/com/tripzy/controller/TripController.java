package com.tripzy.controller;

import com.tripzy.dto.TripDtos.CreateTripRequest;
import com.tripzy.dto.TripDtos.JoinRequestActionDto;
import com.tripzy.dto.TripDtos.JoinRequestCreateDto;
import com.tripzy.entity.JoinRequest;
import com.tripzy.entity.Trip;
import com.tripzy.entity.TripParticipant;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.JoinRequestService;
import com.tripzy.service.TripService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;
    private final JoinRequestService joinRequestService;

    public TripController(TripService tripService, JoinRequestService joinRequestService) {
        this.tripService = tripService;
        this.joinRequestService = joinRequestService;
    }

    @GetMapping
    public ResponseEntity<List<Trip>> searchTrips(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return ResponseEntity.ok(tripService.searchTrips(destination, category, maxBudget, startDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<TripParticipant>> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripParticipants(id));
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(@AuthenticationPrincipal UserPrincipal principal,
                                           @Valid @RequestBody CreateTripRequest request) {
        return ResponseEntity.ok(tripService.createTrip(principal.getId(), request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Trip> cancelTrip(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long id) {
        return ResponseEntity.ok(tripService.cancelTrip(principal.getId(), id));
    }

    @GetMapping("/my-created")
    public ResponseEntity<List<Trip>> getMyCreatedTrips(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tripService.getTripsCreatedBy(principal.getId()));
    }

    @GetMapping("/my-joined")
    public ResponseEntity<List<Trip>> getMyJoinedTrips(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tripService.getTripsJoinedBy(principal.getId()));
    }

    @GetMapping("/my-pending")
    public ResponseEntity<List<JoinRequest>> getMyPendingRequests(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tripService.getPendingRequestsForUser(principal.getId()));
    }

    @PostMapping("/{id}/join-requests")
    public ResponseEntity<JoinRequest> submitJoinRequest(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable Long id,
                                                         @RequestBody(required = false) JoinRequestCreateDto dto) {
        String msg = dto != null ? dto.getMessage() : null;
        return ResponseEntity.ok(joinRequestService.submitJoinRequest(principal.getId(), id, msg));
    }

    @GetMapping("/{id}/join-requests")
    public ResponseEntity<List<JoinRequest>> getTripJoinRequests(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable Long id) {
        return ResponseEntity.ok(joinRequestService.getRequestsForTrip(principal.getId(), id));
    }

    @PatchMapping("/join-requests/{requestId}")
    public ResponseEntity<JoinRequest> reviewJoinRequest(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable Long requestId,
                                                         @RequestBody JoinRequestActionDto dto) {
        return ResponseEntity.ok(joinRequestService.reviewJoinRequest(principal.getId(), requestId, dto.getStatus()));
    }
}
