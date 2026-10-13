package com.tripzy.service;

import com.tripzy.dto.CommunityDtos.CreateSafetyReportRequest;
import com.tripzy.dto.CommunityDtos.CreateSupportRequest;
import com.tripzy.entity.SafetyReport;
import com.tripzy.entity.SupportRequest;
import com.tripzy.entity.User;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.SafetyReportRepository;
import com.tripzy.repository.SupportRequestRepository;
import com.tripzy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SafetyService {

    private final SafetyReportRepository reportRepository;
    private final SupportRequestRepository supportRepository;
    private final UserRepository userRepository;

    public SafetyService(SafetyReportRepository reportRepository,
                         SupportRequestRepository supportRepository,
                         UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.supportRepository = supportRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SafetyReport createReport(Long userId, CreateSafetyReportRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SafetyReport report = new SafetyReport();
        report.setReporterId(user.getId());
        report.setReporterName(user.getFullName());
        report.setTargetType(request.getTargetType());
        report.setTargetId(request.getTargetId());
        report.setTargetName(request.getTargetName());
        report.setReason(request.getReason());
        report.setDetails(request.getDetails());
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    @Transactional
    public SupportRequest createSupportRequest(Long userId, CreateSupportRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SupportRequest req = new SupportRequest();
        req.setUserId(user.getId());
        req.setUserEmail(user.getEmail());
        req.setSubject(request.getSubject());
        req.setMessage(request.getMessage());
        req.setCategory(request.getCategory() != null ? request.getCategory() : "GENERAL");
        req.setStatus("OPEN");
        req.setCreatedAt(LocalDateTime.now());

        return supportRepository.save(req);
    }

    public List<SupportRequest> getUserSupportRequests(Long userId) {
        return supportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> getSafetyGuidelines() {
        Map<String, Object> data = new HashMap<>();
        data.put("emergencyNumbers", Map.of(
                "International SOS", "+1-800-555-0199",
                "Tourist Police (India)", "112 / 1363",
                "European Emergency", "112",
                "US & Canada Emergency", "911"
        ));
        data.put("safetyTips", List.of(
                "Always verify trip organizers and participant trust badges prior to departure.",
                "Share live itinerary links and organizer contact numbers with trusted family/friends.",
                "Keep emergency reserves in multiple separate payment methods (cash & digital).",
                "Never share private banking credentials, one-time passwords, or government documents in public chat."
        ));
        return data;
    }
}
