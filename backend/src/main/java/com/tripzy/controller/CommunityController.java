package com.tripzy.controller;

import com.tripzy.dto.CommunityDtos.CreateCommentRequest;
import com.tripzy.dto.CommunityDtos.CreatePostRequest;
import com.tripzy.entity.CommunityComment;
import com.tripzy.entity.CommunityPost;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/posts")
    public ResponseEntity<List<CommunityPost>> getPosts(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(communityService.getAllPosts(category));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Map<String, Object>> getPostDetails(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getPostDetails(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<CommunityPost> createPost(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(communityService.createPost(principal.getId(), request));
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long id) {
        return ResponseEntity.ok(communityService.toggleLike(principal.getId(), id));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommunityComment> addComment(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long id,
                                                       @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(communityService.addComment(principal.getId(), id, request));
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<Void> reportPost(@PathVariable Long id) {
        communityService.reportPost(id);
        return ResponseEntity.ok().build();
    }
}
