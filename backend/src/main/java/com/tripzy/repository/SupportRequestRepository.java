package com.tripzy.repository;

import com.tripzy.entity.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {
    List<SupportRequest> findAllByOrderByCreatedAtDesc();
    List<SupportRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SupportRequest> findByStatusOrderByCreatedAtDesc(String status);
}
