package com.tripzy.controller;

import com.tripzy.dto.CommunityDtos.CreateDiaryRequest;
import com.tripzy.entity.TravelDiaryEntry;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.DiaryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diary")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<TravelDiaryEntry>> getMyEntries(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(diaryService.getUserEntries(principal.getId()));
    }

    @GetMapping("/public")
    public ResponseEntity<List<TravelDiaryEntry>> getPublicEntries() {
        return ResponseEntity.ok(diaryService.getPublicEntries());
    }

    @PostMapping
    public ResponseEntity<TravelDiaryEntry> createEntry(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody CreateDiaryRequest request) {
        return ResponseEntity.ok(diaryService.createEntry(principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long id) {
        diaryService.deleteEntry(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
