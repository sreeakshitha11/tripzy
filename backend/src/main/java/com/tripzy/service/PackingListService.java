package com.tripzy.service;

import com.tripzy.dto.PlanDtos.PackingItemRequest;
import com.tripzy.entity.PackingList;
import com.tripzy.entity.PackingListItem;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.PackingListItemRepository;
import com.tripzy.repository.PackingListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PackingListService {

    private final PackingListRepository listRepository;
    private final PackingListItemRepository itemRepository;

    public PackingListService(PackingListRepository listRepository, PackingListItemRepository itemRepository) {
        this.listRepository = listRepository;
        this.itemRepository = itemRepository;
    }

    public List<PackingList> getUserLists(Long userId) {
        return listRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, Object> getListDetails(Long listId) {
        PackingList list = listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Packing list not found"));

        List<PackingListItem> items = itemRepository.findByPackingListId(listId);

        Map<String, Object> res = new HashMap<>();
        res.put("list", list);
        res.put("items", items);
        return res;
    }

    @Transactional
    public PackingList createSuggestedList(Long userId, String destination, String duration, String style) {
        PackingList list = new PackingList();
        list.setUserId(userId);
        list.setTitle("Packing List for " + destination);
        list.setDestinationName(destination);
        list.setIsShared(false);
        list.setCreatedAt(LocalDateTime.now());
        PackingList saved = listRepository.save(list);

        // Prepopulate with intelligent suggestions
        List<PackingListItem> suggestions = Arrays.asList(
                new PackingListItem(saved.getId(), "Documents", "Passport / Government ID & Visa Copies", true),
                new PackingListItem(saved.getId(), "Documents", "Flight & Hotel Booking Confirmations", true),
                new PackingListItem(saved.getId(), "Documents", "Travel Insurance Card", true),
                new PackingListItem(saved.getId(), "Clothing", "Weather-appropriate layers & rain shell", true),
                new PackingListItem(saved.getId(), "Clothing", "Comfortable trail/walking footwear", true),
                new PackingListItem(saved.getId(), "Clothing", "Thermal innerwear or breathable activewear", true),
                new PackingListItem(saved.getId(), "Toiletries", "Biodegradable sunscreen & lip balm", true),
                new PackingListItem(saved.getId(), "Toiletries", "Travel-size grooming essentials", true),
                new PackingListItem(saved.getId(), "Electronics", "Universal travel adapter & power bank", true),
                new PackingListItem(saved.getId(), "Electronics", "Camera with extra memory card", true),
                new PackingListItem(saved.getId(), "Medicines", "Personal first-aid kit & pain relievers", true),
                new PackingListItem(saved.getId(), "Medicines", "Altitude / Motion sickness tablets", true)
        );

        itemRepository.saveAll(suggestions);
        return saved;
    }

    @Transactional
    public PackingListItem addItem(Long listId, PackingItemRequest request) {
        PackingList list = listRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Packing list not found"));

        PackingListItem item = new PackingListItem(
                list.getId(),
                request.getCategory() != null ? request.getCategory() : "Essentials",
                request.getItemName(),
                Boolean.TRUE.equals(request.getIsAiSuggested())
        );

        return itemRepository.save(item);
    }

    @Transactional
    public PackingListItem toggleItem(Long itemId) {
        PackingListItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        item.setIsPacked(!item.getIsPacked());
        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        itemRepository.deleteById(itemId);
    }
}
