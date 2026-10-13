package com.tripzy.controller;

import com.tripzy.dto.CommunityDtos.CreateSafetyReportRequest;
import com.tripzy.dto.CommunityDtos.CreateSupportRequest;
import com.tripzy.entity.SafetyReport;
import com.tripzy.entity.SupportRequest;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.SafetyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    private final SafetyService safetyService;

    public SafetyController(SafetyService safetyService) {
        this.safetyService = safetyService;
    }

    @PostMapping("/reports")
    public ResponseEntity<SafetyReport> createReport(@AuthenticationPrincipal UserPrincipal principal,
                                                     @Valid @RequestBody CreateSafetyReportRequest request) {
        return ResponseEntity.ok(safetyService.createReport(principal.getId(), request));
    }

    @PostMapping("/support")
    public ResponseEntity<SupportRequest> createSupportRequest(@AuthenticationPrincipal UserPrincipal principal,
                                                               @Valid @RequestBody CreateSupportRequest request) {
        return ResponseEntity.ok(safetyService.createSupportRequest(principal.getId(), request));
    }

    @GetMapping("/support/my")
    public ResponseEntity<List<SupportRequest>> getMySupportRequests(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(safetyService.getUserSupportRequests(principal.getId()));
    }

    @GetMapping("/guidelines")
    public ResponseEntity<Map<String, Object>> getGuidelines() {
        return ResponseEntity.ok(safetyService.getSafetyGuidelines());
    }
}
