package com.tripzy.controller;

import com.tripzy.dto.PlanDtos.PackingItemRequest;
import com.tripzy.entity.PackingList;
import com.tripzy.entity.PackingListItem;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.PackingListService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packing-lists")
public class PackingListController {

    private final PackingListService packingListService;

    public PackingListController(PackingListService packingListService) {
        this.packingListService = packingListService;
    }

    @GetMapping
    public ResponseEntity<List<PackingList>> getUserLists(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(packingListService.getUserLists(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getListDetails(@PathVariable Long id) {
        return ResponseEntity.ok(packingListService.getListDetails(id));
    }

    @PostMapping("/suggest")
    public ResponseEntity<PackingList> createSuggestedList(@AuthenticationPrincipal UserPrincipal principal,
                                                           @RequestBody Map<String, String> body) {
        String dest = body.getOrDefault("destination", "General Adventure");
        String duration = body.getOrDefault("duration", "1 Week");
        String style = body.getOrDefault("style", "Explorer");
        return ResponseEntity.ok(packingListService.createSuggestedList(principal.getId(), dest, duration, style));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<PackingListItem> addItem(@PathVariable Long id,
                                                   @Valid @RequestBody PackingItemRequest request) {
        return ResponseEntity.ok(packingListService.addItem(id, request));
    }

    @PatchMapping("/items/{itemId}/toggle")
    public ResponseEntity<PackingListItem> toggleItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(packingListService.toggleItem(itemId));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        packingListService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
