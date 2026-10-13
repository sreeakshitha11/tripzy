package com.tripzy.repository;

import com.tripzy.entity.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByItineraryIdOrderByDayNumberAscSortOrderAsc(Long itineraryId);
}
