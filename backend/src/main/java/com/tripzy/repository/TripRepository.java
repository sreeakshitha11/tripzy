package com.tripzy.repository;

import com.tripzy.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByDestinationId(Long destinationId);

    List<Trip> findByDestinationNameContainingIgnoreCase(String destinationName);

    List<Trip> findByOrganizerId(Long organizerId);

    List<Trip> findByStatus(String status);

    @Query("SELECT t FROM Trip t WHERE " +
           "(:destination IS NULL OR LOWER(t.destinationName) LIKE LOWER(CONCAT('%', :destination, '%')) OR LOWER(t.title) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
           "(:category IS NULL OR LOWER(t.category) = LOWER(:category)) AND " +
           "(:maxBudget IS NULL OR t.estimatedBudget <= :maxBudget) AND " +
           "(:startDate IS NULL OR t.startDate >= :startDate)")
    List<Trip> filterTrips(@Param("destination") String destination,
                           @Param("category") String category,
                           @Param("maxBudget") Double maxBudget,
                           @Param("startDate") LocalDate startDate);
}
