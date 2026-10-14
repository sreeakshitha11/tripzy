package com.tripzy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PlanDtos {

    public static class ItineraryGenerateRequest {
        @NotBlank(message = "Destination is required")
        private String destination;
        private Integer days = 3;
        private String travelStyle = "Explorer";
        private String budget = "Moderate";
        private String interests = "Sightseeing, Food, Culture";

        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public Integer getDays() { return days; }
        public void setDays(Integer days) { this.days = days; }
        public String getTravelStyle() { return travelStyle; }
        public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
        public String getBudget() { return budget; }
        public void setBudget(String budget) { this.budget = budget; }
        public String getInterests() { return interests; }
        public void setInterests(String interests) { this.interests = interests; }
    }

    public static class CreateItineraryItemRequest {
        private Integer dayNumber = 1;
        private String timeSlot = "09:00 AM";
        @NotBlank(message = "Title is required")
        private String title;
        private String description;
        private String locationName;
        private Double latitude;
        private Double longitude;
        private Double estimatedCost = 0.0;
        private String notes;
        private Integer sortOrder = 0;

        public Integer getDayNumber() { return dayNumber; }
        public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public Double getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Integer getSortOrder() { return sortOrder; }
        public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    }

    public static class CreateExpenseRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String category = "Food & Dining";
        @NotNull(message = "Amount is required")
        private Double amount;
        private String currency = "INR";
        private String splitType = "EQUAL";
        private String notes;
        private List<Long> memberIds; // for equal split or custom calculation

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getSplitType() { return splitType; }
        public void setSplitType(String splitType) { this.splitType = splitType; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public List<Long> getMemberIds() { return memberIds; }
        public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
    }

    public static class PackingItemRequest {
        private String category = "Essentials";
        @NotBlank(message = "Item name is required")
        private String itemName;
        private Boolean isAiSuggested = false;

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public Boolean getIsAiSuggested() { return isAiSuggested; }
        public void setIsAiSuggested(Boolean isAiSuggested) { this.isAiSuggested = isAiSuggested; }
    }
}
