package com.tripzy.repository;

import com.tripzy.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> {
    Optional<TravelGroup> findByTripId(Long tripId);
}
