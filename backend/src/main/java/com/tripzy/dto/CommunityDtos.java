package com.tripzy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CommunityDtos {

    public static class CreatePostRequest {
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Content is required")
        private String content;
        private String category = "STORY";
        private String destinationName;
        private String imageUrl;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDestinationName() { return destinationName; }
        public void setDestinationName(String destinationName) { this.destinationName = destinationName; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class CreateCommentRequest {
        @NotBlank(message = "Comment cannot be empty")
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class CreateDiaryRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String destinationName;
        private LocalDate visitDate = LocalDate.now();
        private String content;
        private String imageUrl;
        private String activities;
        private Double expenses;
        private Integer rating = 5;
        private String visibility = "PUBLIC";

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDestinationName() { return destinationName; }
        public void setDestinationName(String destinationName) { this.destinationName = destinationName; }
        public LocalDate getVisitDate() { return visitDate; }
        public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getActivities() { return activities; }
        public void setActivities(String activities) { this.activities = activities; }
        public Double getExpenses() { return expenses; }
        public void setExpenses(Double expenses) { this.expenses = expenses; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }
    }

    public static class CreateReviewRequest {
        @NotNull(message = "Destination ID is required")
        private Long destinationId;
        private Long tripId;
        @NotNull(message = "Rating is required")
        private Integer rating;
        @NotBlank(message = "Comment is required")
        private String comment;

        public Long getDestinationId() { return destinationId; }
        public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }
        public Long getTripId() { return tripId; }
        public void setTripId(Long tripId) { this.tripId = tripId; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class CreateSafetyReportRequest {
        @NotBlank(message = "Target type is required")
        private String targetType;
        @NotNull(message = "Target ID is required")
        private Long targetId;
        private String targetName;
        @NotBlank(message = "Reason is required")
        private String reason;
        private String details;

        public String getTargetType() { return targetType; }
        public void setTargetType(String targetType) { this.targetType = targetType; }
        public Long getTargetId() { return targetId; }
        public void setTargetId(Long targetId) { this.targetId = targetId; }
        public String getTargetName() { return targetName; }
        public void setTargetName(String targetName) { this.targetName = targetName; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
    }

    public static class CreateSupportRequest {
        @NotBlank(message = "Subject is required")
        private String subject;
        @NotBlank(message = "Message is required")
        private String message;
        private String category = "GENERAL";

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public static class AiChatRequest {
        @NotBlank(message = "Message is required")
        private String message;
        private String contextDestination;
        private Long contextTripId;
        private List<String> conversationHistory;
        private List<ChatTurn> history;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getContextDestination() { return contextDestination; }
        public void setContextDestination(String contextDestination) { this.contextDestination = contextDestination; }
        public Long getContextTripId() { return contextTripId; }
        public void setContextTripId(Long contextTripId) { this.contextTripId = contextTripId; }
        public List<String> getConversationHistory() { return conversationHistory; }
        public void setConversationHistory(List<String> conversationHistory) { this.conversationHistory = conversationHistory; }
        public List<ChatTurn> getHistory() { return history; }
        public void setHistory(List<ChatTurn> history) { this.history = history; }
    }

    public static class ChatTurn {
        private String role; // "user" or "assistant"
        private String text;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class AiChatResponse {
        private String reply;
        private List<String> suggestedFollowUps;
        private List<Object> referencedData;

        public AiChatResponse() {}

        public AiChatResponse(String reply, List<String> suggestedFollowUps, List<Object> referencedData) {
            this.reply = reply;
            this.suggestedFollowUps = suggestedFollowUps;
            this.referencedData = referencedData;
        }

        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
        public List<String> getSuggestedFollowUps() { return suggestedFollowUps; }
        public void setSuggestedFollowUps(List<String> suggestedFollowUps) { this.suggestedFollowUps = suggestedFollowUps; }
        public List<Object> getReferencedData() { return referencedData; }
        public void setReferencedData(List<Object> referencedData) { this.referencedData = referencedData; }
    }
}
