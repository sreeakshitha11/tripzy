package com.tripzy.controller;

import com.tripzy.entity.Destination;
import com.tripzy.entity.DestinationImage;
import com.tripzy.service.DestinationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @GetMapping
    public ResponseEntity<List<Destination>> getDestinations(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(destinationService.searchDestinations(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getDestinationById(id));
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<DestinationImage>> getImages(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getDestinationImages(id));
    }
}
