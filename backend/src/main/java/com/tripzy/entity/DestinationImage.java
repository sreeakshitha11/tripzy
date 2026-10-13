package com.tripzy.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "destination_images")
public class DestinationImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long destinationId;

    private String imageUrl;

    private String caption;

    public DestinationImage() {}

    public DestinationImage(Long destinationId, String imageUrl, String caption) {
        this.destinationId = destinationId;
        this.imageUrl = imageUrl;
        this.caption = caption;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDestinationId() { return destinationId; }
    public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
}
