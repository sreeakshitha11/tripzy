package com.tripzy.service;

import com.tripzy.entity.Destination;
import com.tripzy.entity.DestinationImage;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.DestinationImageRepository;
import com.tripzy.repository.DestinationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final DestinationImageRepository imageRepository;

    public DestinationService(DestinationRepository destinationRepository, DestinationImageRepository imageRepository) {
        this.destinationRepository = destinationRepository;
        this.imageRepository = imageRepository;
    }

    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    public Destination getDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
    }

    public List<Destination> searchDestinations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return destinationRepository.findAll();
        }
        return destinationRepository.searchDestinations(query.trim());
    }

    public List<DestinationImage> getDestinationImages(Long destinationId) {
        return imageRepository.findByDestinationId(destinationId);
    }
}
