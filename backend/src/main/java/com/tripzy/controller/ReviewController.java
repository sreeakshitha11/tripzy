package com.tripzy.controller;

import com.tripzy.dto.CommunityDtos.CreateReviewRequest;
import com.tripzy.entity.DestinationReview;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/destination/{destId}")
    public ResponseEntity<List<DestinationReview>> getDestinationReviews(@PathVariable Long destId) {
        return ResponseEntity.ok(reviewService.getDestinationReviews(destId));
    }

    @PostMapping
    public ResponseEntity<DestinationReview> addReview(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.addReview(principal.getId(), request));
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<DestinationReview> voteHelpful(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.voteHelpful(id));
    }
}
