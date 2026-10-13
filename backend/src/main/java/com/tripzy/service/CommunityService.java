package com.tripzy.service;

import com.tripzy.dto.CommunityDtos.CreateCommentRequest;
import com.tripzy.dto.CommunityDtos.CreatePostRequest;
import com.tripzy.entity.*;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final CommunityLikeRepository likeRepository;
    private final UserRepository userRepository;

    public CommunityService(CommunityPostRepository postRepository,
                            CommunityCommentRepository commentRepository,
                            CommunityLikeRepository likeRepository,
                            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
    }

    public List<CommunityPost> getAllPosts(String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return postRepository.findByCategoryOrderByCreatedAtDesc(category);
        }
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getPostDetails(Long postId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        List<CommunityComment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);

        Map<String, Object> res = new HashMap<>();
        res.put("post", post);
        res.put("comments", comments);
        return res;
    }

    @Transactional
    public CommunityPost createPost(Long userId, CreatePostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CommunityPost post = new CommunityPost();
        post.setAuthorId(user.getId());
        post.setAuthorName(user.getFullName());
        post.setAuthorAvatar(user.getAvatarUrl());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory() != null ? request.getCategory() : "STORY");
        post.setDestinationName(request.getDestinationName());
        post.setImageUrl(request.getImageUrl());
        post.setCreatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    @Transactional
    public Map<String, Object> toggleLike(Long userId, Long postId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Optional<CommunityLike> likeOpt = likeRepository.findByPostIdAndUserId(postId, userId);
        boolean liked;
        if (likeOpt.isPresent()) {
            likeRepository.delete(likeOpt.get());
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            liked = false;
        } else {
            likeRepository.save(new CommunityLike(postId, userId));
            post.setLikesCount(post.getLikesCount() + 1);
            liked = true;
        }
        postRepository.save(post);

        Map<String, Object> res = new HashMap<>();
        res.put("liked", liked);
        res.put("likesCount", post.getLikesCount());
        return res;
    }

    @Transactional
    public CommunityComment addComment(Long userId, Long postId, CreateCommentRequest request) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CommunityComment comment = new CommunityComment(
                postId,
                user.getId(),
                user.getFullName(),
                user.getAvatarUrl(),
                request.getContent()
        );
        CommunityComment saved = commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return saved;
    }

    @Transactional
    public void reportPost(Long postId) {
        postRepository.findById(postId).ifPresent(post -> {
            post.setIsReported(true);
            postRepository.save(post);
        });
    }
}
