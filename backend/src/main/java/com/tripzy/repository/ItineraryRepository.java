package com.tripzy.repository;

import com.tripzy.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    Optional<Itinerary> findByTripId(Long tripId);
    List<Itinerary> findByUserId(Long userId);
}
