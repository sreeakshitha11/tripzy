package com.tripzy.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private String preferredInterests; // e.g. "Adventure, Mountains, Culture, Photography"

    private String preferredDestinations;

    private String preferredBudget = "Moderate"; // Budget, Moderate, Luxury

    private String preferredDuration = "1-2 Weeks";

    private String preferredTravelStyle = "Explorer";

    public UserPreference() {}

    public UserPreference(Long userId, String preferredInterests, String preferredDestinations, String preferredBudget, String preferredDuration, String preferredTravelStyle) {
        this.userId = userId;
        this.preferredInterests = preferredInterests;
        this.preferredDestinations = preferredDestinations;
        this.preferredBudget = preferredBudget;
        this.preferredDuration = preferredDuration;
        this.preferredTravelStyle = preferredTravelStyle;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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
