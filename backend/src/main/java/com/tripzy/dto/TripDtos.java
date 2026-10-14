package com.tripzy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TripDtos {

    public static class CreateTripRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private Long destinationId;

        @NotBlank(message = "Destination name is required")
        private String destinationName;

        private String description;
        private String category = "Adventure";

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        private Integer durationDays;
        private String transportType;
        private String accommodationPlan;
        private String meetingPoint;
        private Double estimatedBudget;
        private String currency = "INR";
        private Integer minParticipants = 2;
        private Integer maxParticipants = 8;
        private String travelStyle;
        private String tripRules;
        private String coverImageUrl;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Long getDestinationId() { return destinationId; }
        public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }
        public String getDestinationName() { return destinationName; }
        public void setDestinationName(String destinationName) { this.destinationName = destinationName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public Integer getDurationDays() { return durationDays; }
        public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
        public String getTransportType() { return transportType; }
        public void setTransportType(String transportType) { this.transportType = transportType; }
        public String getAccommodationPlan() { return accommodationPlan; }
        public void setAccommodationPlan(String accommodationPlan) { this.accommodationPlan = accommodationPlan; }
        public String getMeetingPoint() { return meetingPoint; }
        public void setMeetingPoint(String meetingPoint) { this.meetingPoint = meetingPoint; }
        public Double getEstimatedBudget() { return estimatedBudget; }
        public void setEstimatedBudget(Double estimatedBudget) { this.estimatedBudget = estimatedBudget; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public Integer getMinParticipants() { return minParticipants; }
        public void setMinParticipants(Integer minParticipants) { this.minParticipants = minParticipants; }
        public Integer getMaxParticipants() { return maxParticipants; }
        public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
        public String getTravelStyle() { return travelStyle; }
        public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
        public String getTripRules() { return tripRules; }
        public void setTripRules(String tripRules) { this.tripRules = tripRules; }
        public String getCoverImageUrl() { return coverImageUrl; }
        public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    }

    public static class JoinRequestCreateDto {
        private String message;
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class JoinRequestActionDto {
        private String status; // ACCEPTED, REJECTED
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
