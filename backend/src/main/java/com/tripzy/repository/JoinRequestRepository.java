package com.tripzy.repository;

import com.tripzy.entity.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByTripId(Long tripId);
    List<JoinRequest> findByApplicantId(Long applicantId);
    List<JoinRequest> findByTripIdAndStatus(Long tripId, String status);
    Optional<JoinRequest> findByTripIdAndApplicantId(Long tripId, Long applicantId);
    boolean existsByTripIdAndApplicantIdAndStatus(Long tripId, Long applicantId, String status);
}
