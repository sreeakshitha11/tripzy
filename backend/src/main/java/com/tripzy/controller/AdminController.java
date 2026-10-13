package com.tripzy.controller;

import com.tripzy.entity.*;
import com.tripzy.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/toggle-verified")
    public ResponseEntity<User> toggleVerified(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserVerification(userId));
    }

    @GetMapping("/trips")
    public ResponseEntity<List<Trip>> getTrips() {
        return ResponseEntity.ok(adminService.getAllTrips());
    }

    @PatchMapping("/trips/{tripId}/status")
    public ResponseEntity<Trip> updateTripStatus(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateTripStatus(tripId, body.get("status")));
    }

    @GetMapping("/reported-posts")
    public ResponseEntity<List<CommunityPost>> getReportedPosts() {
        return ResponseEntity.ok(adminService.getReportedPosts());
    }

    @DeleteMapping("/reported-posts/{postId}")
    public ResponseEntity<Void> deleteReportedPost(@PathVariable Long postId) {
        adminService.deleteReportedPost(postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/safety-reports")
    public ResponseEntity<List<SafetyReport>> getSafetyReports() {
        return ResponseEntity.ok(adminService.getAllSafetyReports());
    }

    @PatchMapping("/safety-reports/{reportId}")
    public ResponseEntity<SafetyReport> resolveReport(@PathVariable Long reportId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.resolveSafetyReport(reportId, body.get("status")));
    }

    @GetMapping("/support-requests")
    public ResponseEntity<List<SupportRequest>> getSupportRequests() {
        return ResponseEntity.ok(adminService.getAllSupportRequests());
    }

    @PatchMapping("/support-requests/{id}")
    public ResponseEntity<SupportRequest> updateSupportStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateSupportStatus(id, body.get("status")));
    }
}
