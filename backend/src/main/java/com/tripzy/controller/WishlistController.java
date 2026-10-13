package com.tripzy.controller;

import com.tripzy.entity.WishlistItem;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(principal.getId()));
    }

    @PostMapping("/destinations/{destinationId}")
    public ResponseEntity<WishlistItem> saveDestination(@AuthenticationPrincipal UserPrincipal principal,
                                                        @PathVariable Long destinationId,
                                                        @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(wishlistService.saveDestination(principal.getId(), destinationId, notes));
    }

    @PostMapping("/trips/{tripId}")
    public ResponseEntity<WishlistItem> saveTrip(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable Long tripId,
                                                @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(wishlistService.saveTrip(principal.getId(), tripId, notes));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable Long itemId) {
        wishlistService.removeFromWishlist(principal.getId(), itemId);
        return ResponseEntity.noContent().build();
    }
}
