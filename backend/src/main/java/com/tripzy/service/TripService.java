package com.tripzy.service;

import com.tripzy.dto.TripDtos.CreateTripRequest;
import com.tripzy.entity.*;
import com.tripzy.exception.BadRequestException;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.exception.UnauthorizedException;
import com.tripzy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final TripParticipantRepository participantRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final TravelGroupRepository travelGroupRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository,
                       TripParticipantRepository participantRepository,
                       JoinRequestRepository joinRequestRepository,
                       TravelGroupRepository travelGroupRepository,
                       ItineraryRepository itineraryRepository,
                       UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.participantRepository = participantRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.travelGroupRepository = travelGroupRepository;
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
    }

    public List<Trip> searchTrips(String destination, String category, Double maxBudget, LocalDate startDate) {
        String destQuery = (destination != null && !destination.isBlank()) ? destination.trim() : null;
        String catQuery = (category != null && !category.isBlank()) ? category.trim() : null;
        return tripRepository.filterTrips(destQuery, catQuery, maxBudget, startDate);
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    public List<TripParticipant> getTripParticipants(Long tripId) {
        return participantRepository.findByTripId(tripId);
    }

    @Transactional
    public Trip createTrip(Long userId, CreateTripRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        Trip trip = new Trip();
        trip.setTitle(request.getTitle());
        trip.setDestinationId(request.getDestinationId());
        trip.setDestinationName(request.getDestinationName());
        trip.setOrganizerId(user.getId());
        trip.setOrganizerName(user.getFullName());
        trip.setOrganizerAvatar(user.getAvatarUrl());
        trip.setDescription(request.getDescription());
        trip.setCategory(request.getCategory() != null ? request.getCategory() : "Adventure");
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setDurationDays(request.getDurationDays() != null ? request.getDurationDays() : 5);
        trip.setTransportType(request.getTransportType());
        trip.setAccommodationPlan(request.getAccommodationPlan());
        trip.setMeetingPoint(request.getMeetingPoint());
        trip.setEstimatedBudget(request.getEstimatedBudget() != null ? request.getEstimatedBudget() : 350.0);
        trip.setCurrency("INR");
        trip.setMinParticipants(request.getMinParticipants() != null ? request.getMinParticipants() : 2);
        trip.setMaxParticipants(request.getMaxParticipants() != null ? request.getMaxParticipants() : 8);
        trip.setCurrentParticipants(1);
        trip.setTravelStyle(request.getTravelStyle());
        trip.setTripRules(request.getTripRules());
        String coverUrl = request.getCoverImageUrl();
        trip.setCoverImageUrl(coverUrl != null && !coverUrl.isBlank() ? coverUrl.trim() :
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80");
        trip.setStatus("UPCOMING");
        trip.setCreatedAt(LocalDateTime.now());
        trip.setUpdatedAt(LocalDateTime.now());

        Trip savedTrip = tripRepository.save(trip);

        // Add organizer as participant
        TripParticipant organizerPart = new TripParticipant(
                savedTrip.getId(),
                user.getId(),
                user.getFullName(),
                user.getAvatarUrl(),
                "ORGANIZER"
        );
        participantRepository.save(organizerPart);

        // Create Travel Group for accepted members
        TravelGroup group = new TravelGroup();
        group.setTripId(savedTrip.getId());
        group.setName(savedTrip.getTitle() + " Group");
        group.setDescription("Official chat and coordination group for " + savedTrip.getTitle());
        group.setOrganizerId(user.getId());
        group.setCoverImageUrl(savedTrip.getCoverImageUrl());
        travelGroupRepository.save(group);

        // Initialize Itinerary
        Itinerary itinerary = new Itinerary();
        itinerary.setTripId(savedTrip.getId());
        itinerary.setUserId(user.getId());
        itinerary.setTitle(savedTrip.getTitle() + " Master Itinerary");
        itinerary.setDestinationName(savedTrip.getDestinationName());
        itinerary.setTotalDays(savedTrip.getDurationDays());
        itineraryRepository.save(itinerary);

        return savedTrip;
    }

    @Transactional
    public Trip cancelTrip(Long userId, Long tripId) {
        Trip trip = getTripById(tripId);
        if (!trip.getOrganizerId().equals(userId)) {
            throw new UnauthorizedException("Only the organizer can cancel this trip");
        }
        trip.setStatus("CANCELLED");
        trip.setUpdatedAt(LocalDateTime.now());
        return tripRepository.save(trip);
    }

    public List<Trip> getTripsCreatedBy(Long userId) {
        return tripRepository.findByOrganizerId(userId);
    }

    public List<Trip> getTripsJoinedBy(Long userId) {
        List<TripParticipant> parts = participantRepository.findByUserId(userId);
        List<Trip> joined = new ArrayList<>();
        for (TripParticipant p : parts) {
            tripRepository.findById(p.getTripId()).ifPresent(trip -> {
                if (!trip.getOrganizerId().equals(userId)) {
                    joined.add(trip);
                }
            });
        }
        return joined;
    }

    public List<JoinRequest> getPendingRequestsForUser(Long userId) {
        return joinRequestRepository.findByApplicantId(userId);
    }
}
