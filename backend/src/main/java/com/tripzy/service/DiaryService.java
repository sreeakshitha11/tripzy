package com.tripzy.service;

import com.tripzy.dto.CommunityDtos.CreateDiaryRequest;
import com.tripzy.entity.TravelDiaryEntry;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.TravelDiaryEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiaryService {

    private final TravelDiaryEntryRepository diaryRepository;

    public DiaryService(TravelDiaryEntryRepository diaryRepository) {
        this.diaryRepository = diaryRepository;
    }

    public List<TravelDiaryEntry> getUserEntries(Long userId) {
        return diaryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<TravelDiaryEntry> getPublicEntries() {
        return diaryRepository.findByVisibilityOrderByCreatedAtDesc("PUBLIC");
    }

    @Transactional
    public TravelDiaryEntry createEntry(Long userId, CreateDiaryRequest request) {
        TravelDiaryEntry entry = new TravelDiaryEntry();
        entry.setUserId(userId);
        entry.setTitle(request.getTitle());
        entry.setDestinationName(request.getDestinationName());
        entry.setVisitDate(request.getVisitDate());
        entry.setContent(request.getContent());
        entry.setImageUrl(request.getImageUrl());
        entry.setActivities(request.getActivities());
        entry.setExpenses(request.getExpenses());
        entry.setRating(request.getRating() != null ? request.getRating() : 5);
        entry.setVisibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC");
        entry.setCreatedAt(LocalDateTime.now());

        return diaryRepository.save(entry);
    }

    @Transactional
    public void deleteEntry(Long userId, Long entryId) {
        TravelDiaryEntry entry = diaryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Diary entry not found"));
        if (entry.getUserId().equals(userId)) {
            diaryRepository.delete(entry);
        }
    }
}
