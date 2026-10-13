package com.tripzy.repository;

import com.tripzy.entity.DestinationReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinationReviewRepository extends JpaRepository<DestinationReview, Long> {
    List<DestinationReview> findByDestinationIdOrderByCreatedAtDesc(Long destinationId);
}
