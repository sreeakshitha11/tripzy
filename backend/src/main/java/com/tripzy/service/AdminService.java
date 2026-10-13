package com.tripzy.service;

import com.tripzy.entity.*;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final CommunityPostRepository postRepository;
    private final SafetyReportRepository reportRepository;
    private final SupportRequestRepository supportRepository;
    private final JoinRequestRepository joinRequestRepository;

    public AdminService(UserRepository userRepository,
                        TripRepository tripRepository,
                        DestinationRepository destinationRepository,
                        CommunityPostRepository postRepository,
                        SafetyReportRepository reportRepository,
                        SupportRequestRepository supportRepository,
                        JoinRequestRepository joinRequestRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.destinationRepository = destinationRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.supportRepository = supportRepository;
        this.joinRequestRepository = joinRequestRepository;
    }

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTrips", tripRepository.count());
        stats.put("activeTrips", tripRepository.findByStatus("UPCOMING").size());
        stats.put("totalDestinations", destinationRepository.count());
        stats.put("pendingReports", reportRepository.findByStatusOrderByCreatedAtDesc("PENDING").size());
        stats.put("openSupportRequests", supportRepository.findByStatusOrderByCreatedAtDesc("OPEN").size());
        stats.put("totalCommunityPosts", postRepository.count());
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsVerified(!Boolean.TRUE.equals(user.getIsVerified()));
        return userRepository.save(user);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    @Transactional
    public Trip updateTripStatus(Long tripId, String status) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        trip.setStatus(status);
        return tripRepository.save(trip);
    }

    public List<CommunityPost> getReportedPosts() {
        return postRepository.findByIsReportedTrue();
    }

    @Transactional
    public void deleteReportedPost(Long postId) {
        postRepository.deleteById(postId);
    }

    public List<SafetyReport> getAllSafetyReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SafetyReport resolveSafetyReport(Long reportId, String status) {
        SafetyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus(status);
        return reportRepository.save(report);
    }

    public List<SupportRequest> getAllSupportRequests() {
        return supportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SupportRequest updateSupportStatus(Long supportId, String status) {
        SupportRequest req = supportRepository.findById(supportId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        req.setStatus(status);
        return supportRepository.save(req);
    }
}
