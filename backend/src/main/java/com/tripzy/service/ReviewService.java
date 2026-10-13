package com.tripzy.service;

import com.tripzy.dto.CommunityDtos.CreateReviewRequest;
import com.tripzy.entity.Destination;
import com.tripzy.entity.DestinationReview;
import com.tripzy.entity.User;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.DestinationRepository;
import com.tripzy.repository.DestinationReviewRepository;
import com.tripzy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final DestinationReviewRepository reviewRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;

    public ReviewService(DestinationReviewRepository reviewRepository,
                         DestinationRepository destinationRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
    }

    public List<DestinationReview> getDestinationReviews(Long destinationId) {
        return reviewRepository.findByDestinationIdOrderByCreatedAtDesc(destinationId);
    }

    @Transactional
    public DestinationReview addReview(Long userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Destination dest = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        DestinationReview review = new DestinationReview();
        review.setDestinationId(dest.getId());
        review.setTripId(request.getTripId());
        review.setUserId(user.getId());
        review.setUserName(user.getFullName());
        review.setUserAvatar(user.getAvatarUrl());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsVerifiedTraveler(true);
        review.setHelpfulVotes(0);
        review.setCreatedAt(LocalDateTime.now());

        DestinationReview saved = reviewRepository.save(review);

        // Update destination rating average
        List<DestinationReview> allReviews = reviewRepository.findByDestinationIdOrderByCreatedAtDesc(dest.getId());
        double avg = allReviews.stream().mapToInt(DestinationReview::getRating).average().orElse(5.0);
        dest.setRating(Math.round(avg * 10.0) / 10.0);
        dest.setReviewCount(allReviews.size());
        destinationRepository.save(dest);

        return saved;
    }

    @Transactional
    public DestinationReview voteHelpful(Long reviewId) {
        DestinationReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setHelpfulVotes(review.getHelpfulVotes() + 1);
        return reviewRepository.save(review);
    }
}
