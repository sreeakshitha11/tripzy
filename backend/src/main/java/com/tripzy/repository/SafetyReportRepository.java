package com.tripzy.repository;

import com.tripzy.entity.SafetyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SafetyReportRepository extends JpaRepository<SafetyReport, Long> {
    List<SafetyReport> findAllByOrderByCreatedAtDesc();
    List<SafetyReport> findByStatusOrderByCreatedAtDesc(String status);
}
