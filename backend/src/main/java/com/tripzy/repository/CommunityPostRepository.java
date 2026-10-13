package com.tripzy.repository;

import com.tripzy.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findAllByOrderByCreatedAtDesc();
    List<CommunityPost> findByCategoryOrderByCreatedAtDesc(String category);
    List<CommunityPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    List<CommunityPost> findByIsReportedTrue();
}
