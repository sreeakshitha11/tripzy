package com.tripzy.repository;

import com.tripzy.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<WishlistItem> findByUserIdAndDestinationId(Long userId, Long destinationId);
    Optional<WishlistItem> findByUserIdAndTripId(Long userId, Long tripId);
    boolean existsByUserIdAndDestinationId(Long userId, Long destinationId);
    boolean existsByUserIdAndTripId(Long userId, Long tripId);
}
