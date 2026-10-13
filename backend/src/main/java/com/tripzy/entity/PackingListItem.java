package com.tripzy.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "packing_list_items")
public class PackingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long packingListId;

    private String category = "Essentials"; // Essentials, Clothing, Toiletries, Documents, Electronics, Medicines

    @Column(nullable = false)
    private String itemName;

    private Boolean isPacked = false;

    private Boolean isAiSuggested = false;

    public PackingListItem() {}

    public PackingListItem(Long packingListId, String category, String itemName, Boolean isAiSuggested) {
        this.packingListId = packingListId;
        this.category = category;
        this.itemName = itemName;
        this.isPacked = false;
        this.isAiSuggested = isAiSuggested;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPackingListId() { return packingListId; }
    public void setPackingListId(Long packingListId) { this.packingListId = packingListId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Boolean getIsPacked() { return isPacked; }
    public void setIsPacked(Boolean isPacked) { this.isPacked = isPacked; }

    public Boolean getIsAiSuggested() { return isAiSuggested; }
    public void setIsAiSuggested(Boolean isAiSuggested) { this.isAiSuggested = isAiSuggested; }
}
