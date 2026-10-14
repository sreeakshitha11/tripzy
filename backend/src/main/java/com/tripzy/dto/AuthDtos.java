package com.tripzy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT); }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String travelStyle = "Explorer";
        private String homeCity;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT); }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getTravelStyle() { return travelStyle; }
        public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
        public String getHomeCity() { return homeCity; }
        public void setHomeCity(String homeCity) { this.homeCity = homeCity; }
    }

    public static class AuthResponse {
        private String token;
        private Long id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private String role;
        private String travelStyle;
        private Integer trustScore;
        private Boolean openToTravel;

        public AuthResponse() {}

        public AuthResponse(String token, Long id, String email, String fullName, String avatarUrl, String role, String travelStyle, Integer trustScore, Boolean openToTravel) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.avatarUrl = avatarUrl;
            this.role = role;
            this.travelStyle = travelStyle;
            this.trustScore = trustScore;
            this.openToTravel = openToTravel;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT); }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getTravelStyle() { return travelStyle; }
        public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
        public Integer getTrustScore() { return trustScore; }
        public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }
        public Boolean getOpenToTravel() { return openToTravel; }
        public void setOpenToTravel(Boolean openToTravel) { this.openToTravel = openToTravel; }
    }

    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT); }
    }

    public static class UserPreferenceRequest {
        private String preferredInterests;
        private String preferredDestinations;
        private String preferredBudget;
        private String preferredDuration;
        private String preferredTravelStyle;

        public String getPreferredInterests() { return preferredInterests; }
        public void setPreferredInterests(String preferredInterests) { this.preferredInterests = preferredInterests; }
        public String getPreferredDestinations() { return preferredDestinations; }
        public void setPreferredDestinations(String preferredDestinations) { this.preferredDestinations = preferredDestinations; }
        public String getPreferredBudget() { return preferredBudget; }
        public void setPreferredBudget(String preferredBudget) { this.preferredBudget = preferredBudget; }
        public String getPreferredDuration() { return preferredDuration; }
        public void setPreferredDuration(String preferredDuration) { this.preferredDuration = preferredDuration; }
        public String getPreferredTravelStyle() { return preferredTravelStyle; }
        public void setPreferredTravelStyle(String preferredTravelStyle) { this.preferredTravelStyle = preferredTravelStyle; }
    }

    public static class UserProfileUpdateRequest {
        private String fullName;
        private String bio;
        private String avatarUrl;
        private String travelStyle;
        private String budgetPreference;
        private Boolean openToTravel;
        private String homeCity;
        private String preferredActivities;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getTravelStyle() { return travelStyle; }
        public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
        public String getBudgetPreference() { return budgetPreference; }
        public void setBudgetPreference(String budgetPreference) { this.budgetPreference = budgetPreference; }
        public Boolean getOpenToTravel() { return openToTravel; }
        public void setOpenToTravel(Boolean openToTravel) { this.openToTravel = openToTravel; }
        public String getHomeCity() { return homeCity; }
        public void setHomeCity(String homeCity) { this.homeCity = homeCity; }
        public String getPreferredActivities() { return preferredActivities; }
        public void setPreferredActivities(String preferredActivities) { this.preferredActivities = preferredActivities; }
    }
}
