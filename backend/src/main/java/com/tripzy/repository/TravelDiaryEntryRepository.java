package com.tripzy.repository;

import com.tripzy.entity.TravelDiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelDiaryEntryRepository extends JpaRepository<TravelDiaryEntry, Long> {
    List<TravelDiaryEntry> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<TravelDiaryEntry> findByVisibilityOrderByCreatedAtDesc(String visibility);
}
