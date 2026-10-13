package com.tripzy.repository;

import com.tripzy.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByNameContainingIgnoreCase(String name);

    @Query("SELECT d FROM Destination d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.country) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Destination> searchDestinations(@Param("query") String query);
}
