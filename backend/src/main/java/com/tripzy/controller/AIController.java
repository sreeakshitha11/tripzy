package com.tripzy.controller;

import com.tripzy.dto.CommunityDtos.AiChatRequest;
import com.tripzy.dto.CommunityDtos.AiChatResponse;
import com.tripzy.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiService.processMessage(request));
    }
}
