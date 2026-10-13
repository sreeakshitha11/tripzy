package com.tripzy.service;

import com.tripzy.entity.Destination;
import com.tripzy.entity.Trip;
import com.tripzy.entity.WishlistItem;
import com.tripzy.exception.BadRequestException;
import com.tripzy.repository.DestinationRepository;
import com.tripzy.repository.TripRepository;
import com.tripzy.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;

    public WishlistService(WishlistItemRepository wishlistRepository,
                           DestinationRepository destinationRepository,
                           TripRepository tripRepository) {
        this.wishlistRepository = wishlistRepository;
        this.destinationRepository = destinationRepository;
        this.tripRepository = tripRepository;
    }

    public List<WishlistItem> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public WishlistItem saveDestination(Long userId, Long destinationId, String notes) {
        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndDestinationId(userId, destinationId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Destination dest = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new BadRequestException("Destination not found"));

        WishlistItem item = new WishlistItem();
        item.setUserId(userId);
        item.setDestinationId(destinationId);
        item.setItemType("DESTINATION");
        item.setTitle(dest.getName());
        item.setImageUrl(dest.getHeroImageUrl());
        item.setNotes(notes);
        item.setCreatedAt(LocalDateTime.now());

        return wishlistRepository.save(item);
    }

    @Transactional
    public WishlistItem saveTrip(Long userId, Long tripId, String notes) {
        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndTripId(userId, tripId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new BadRequestException("Trip not found"));

        WishlistItem item = new WishlistItem();
        item.setUserId(userId);
        item.setTripId(tripId);
        item.setItemType("TRIP");
        item.setTitle(trip.getTitle());
        item.setImageUrl(trip.getCoverImageUrl());
        item.setNotes(notes);
        item.setCreatedAt(LocalDateTime.now());

        return wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long itemId) {
        wishlistRepository.findById(itemId).ifPresent(item -> {
            if (item.getUserId().equals(userId)) {
                wishlistRepository.delete(item);
            }
        });
    }
}
