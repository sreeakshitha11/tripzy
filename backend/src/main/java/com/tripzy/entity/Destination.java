package com.tripzy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "destinations")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;

    private String stateOrCountry;

    private String country;

    private Double latitude;

    private Double longitude;

    private String heroImageUrl;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String overview;

    private String bestTimeToVisit;

    private String cuisine;

    private Double avgBudgetPerDay;

    private String currency = "INR";

    private String tags; // e.g. "Mountains,Adventure,Snow"

    private Double rating = 4.8;

    private Integer reviewCount = 0;

    private String popularAttractions;

    private String transportGuide;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Destination() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStateOrCountry() { return stateOrCountry; }
    public void setStateOrCountry(String stateOrCountry) { this.stateOrCountry = stateOrCountry; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getHeroImageUrl() { return heroImageUrl; }
    public void setHeroImageUrl(String heroImageUrl) { this.heroImageUrl = heroImageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getBestTimeToVisit() { return bestTimeToVisit; }
    public void setBestTimeToVisit(String bestTimeToVisit) { this.bestTimeToVisit = bestTimeToVisit; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public Double getAvgBudgetPerDay() { return avgBudgetPerDay; }
    public void setAvgBudgetPerDay(Double avgBudgetPerDay) { this.avgBudgetPerDay = avgBudgetPerDay; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getPopularAttractions() { return popularAttractions; }
    public void setPopularAttractions(String popularAttractions) { this.popularAttractions = popularAttractions; }

    public String getTransportGuide() { return transportGuide; }
    public void setTransportGuide(String transportGuide) { this.transportGuide = transportGuide; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
