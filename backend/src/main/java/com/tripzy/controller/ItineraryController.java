package com.tripzy.controller;

import com.tripzy.dto.PlanDtos.CreateItineraryItemRequest;
import com.tripzy.dto.PlanDtos.ItineraryGenerateRequest;
import com.tripzy.entity.Itinerary;
import com.tripzy.entity.ItineraryItem;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.ItineraryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Itinerary> generateItinerary(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody ItineraryGenerateRequest request) {
        return ResponseEntity.ok(itineraryService.generateAiItinerary(principal.getId(), request));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<Itinerary> getItineraryByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(itineraryService.getItineraryByTripId(tripId));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ItineraryItem>> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(itineraryService.getItineraryItems(id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ItineraryItem> addItem(@PathVariable Long id,
                                                 @Valid @RequestBody CreateItineraryItemRequest request) {
        return ResponseEntity.ok(itineraryService.addItem(id, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        itineraryService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
