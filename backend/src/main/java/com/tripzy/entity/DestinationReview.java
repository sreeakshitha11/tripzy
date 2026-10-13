package com.tripzy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "destination_reviews")
public class DestinationReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long destinationId;

    private Long tripId;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    private String userAvatar;

    @Column(nullable = false)
    private Integer rating = 5;

    @Column(nullable = false, length = 1500)
    private String comment;

    private Boolean isVerifiedTraveler = true;

    private Integer helpfulVotes = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    public DestinationReview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDestinationId() { return destinationId; }
    public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Boolean getIsVerifiedTraveler() { return isVerifiedTraveler; }
    public void setIsVerifiedTraveler(Boolean isVerifiedTraveler) { this.isVerifiedTraveler = isVerifiedTraveler; }

    public Integer getHelpfulVotes() { return helpfulVotes; }
    public void setHelpfulVotes(Integer helpfulVotes) { this.helpfulVotes = helpfulVotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
