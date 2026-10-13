package com.tripzy.service;

import com.tripzy.dto.PlanDtos.CreateItineraryItemRequest;
import com.tripzy.dto.PlanDtos.ItineraryGenerateRequest;
import com.tripzy.entity.Destination;
import com.tripzy.entity.Itinerary;
import com.tripzy.entity.ItineraryItem;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.DestinationRepository;
import com.tripzy.repository.ItineraryItemRepository;
import com.tripzy.repository.ItineraryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final ItineraryItemRepository itemRepository;
    private final DestinationRepository destinationRepository;

    public ItineraryService(ItineraryRepository itineraryRepository,
                            ItineraryItemRepository itemRepository,
                            DestinationRepository destinationRepository) {
        this.itineraryRepository = itineraryRepository;
        this.itemRepository = itemRepository;
        this.destinationRepository = destinationRepository;
    }

    public Itinerary getItineraryByTripId(Long tripId) {
        return itineraryRepository.findByTripId(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("No itinerary found for trip: " + tripId));
    }

    public List<ItineraryItem> getItineraryItems(Long itineraryId) {
        return itemRepository.findByItineraryIdOrderByDayNumberAscSortOrderAsc(itineraryId);
    }

    @Transactional
    public Itinerary generateAiItinerary(Long userId, ItineraryGenerateRequest request) {
        Itinerary itinerary = new Itinerary();
        itinerary.setUserId(userId);
        itinerary.setTitle(request.getDestination() + " " + request.getDays() + "-Day Curated Journey");
        itinerary.setDestinationName(request.getDestination());
        itinerary.setTotalDays(request.getDays());
        itinerary.setCreatedAt(LocalDateTime.now());
        Itinerary saved = itineraryRepository.save(itinerary);

        // Fetch destination info if available
        List<Destination> found = destinationRepository.findByNameContainingIgnoreCase(request.getDestination());
        Destination dest = !found.isEmpty() ? found.get(0) : null;
        Double lat = dest != null ? dest.getLatitude() : 0.0;
        Double lng = dest != null ? dest.getLongitude() : 0.0;

        List<ItineraryItem> items = new ArrayList<>();
        int days = Math.max(1, Math.min(request.getDays(), 14));

        for (int day = 1; day <= days; day++) {
            // Morning
            ItineraryItem morning = new ItineraryItem();
            morning.setItineraryId(saved.getId());
            morning.setDayNumber(day);
            morning.setTimeSlot("09:00 AM");
            morning.setTitle(day == 1 ? "Arrival & Scenic Orientation" : "Morning Landmark Exploration");
            morning.setDescription(day == 1 ? "Check into accommodation, refresh, and explore nearby local cafes." :
                    "Guided visit to key cultural monuments and scenic viewpoints.");
            morning.setLocationName(request.getDestination() + " Central");
            morning.setLatitude(lat);
            morning.setLongitude(lng);
            morning.setEstimatedCost(25.0);
            morning.setNotes("Wear comfortable walking shoes. Keep hydration ready.");
            morning.setSortOrder(1);
            items.add(itemRepository.save(morning));

            // Afternoon
            ItineraryItem afternoon = new ItineraryItem();
            afternoon.setItineraryId(saved.getId());
            afternoon.setDayNumber(day);
            afternoon.setTimeSlot("01:30 PM");
            afternoon.setTitle("Local Cuisine & Adventure Activity");
            afternoon.setDescription("Authentic lunch followed by outdoor activities tailored to " + request.getTravelStyle() + " style.");
            afternoon.setLocationName(request.getDestination() + " Valley / Waterfront");
            afternoon.setLatitude(lat);
            afternoon.setLongitude(lng);
            afternoon.setEstimatedCost(40.0);
            afternoon.setNotes("Check weather conditions before outdoor session.");
            afternoon.setSortOrder(2);
            items.add(itemRepository.save(afternoon));

            // Evening
            ItineraryItem evening = new ItineraryItem();
            evening.setItineraryId(saved.getId());
            evening.setDayNumber(day);
            evening.setTimeSlot("06:30 PM");
            evening.setTitle("Sunset Gathering & Night Market");
            evening.setDescription("Witness sunset over the horizon, explore artisan bazaars, and group dinner.");
            evening.setLocationName(request.getDestination() + " Sunset Promenade");
            evening.setLatitude(lat);
            evening.setLongitude(lng);
            evening.setEstimatedCost(35.0);
            evening.setNotes("Great photo opportunities during golden hour.");
            evening.setSortOrder(3);
            items.add(itemRepository.save(evening));
        }

        return saved;
    }

    @Transactional
    public ItineraryItem addItem(Long itineraryId, CreateItineraryItemRequest request) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found"));

        ItineraryItem item = new ItineraryItem();
        item.setItineraryId(itinerary.getId());
        item.setDayNumber(request.getDayNumber());
        item.setTimeSlot(request.getTimeSlot());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLocationName(request.getLocationName());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        item.setEstimatedCost(request.getEstimatedCost() != null ? request.getEstimatedCost() : 0.0);
        item.setNotes(request.getNotes());
        item.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        itemRepository.deleteById(itemId);
    }
}
