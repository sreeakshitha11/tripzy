package com.tripzy.repository;

import com.tripzy.entity.GroupAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupAnnouncementRepository extends JpaRepository<GroupAnnouncement, Long> {
    List<GroupAnnouncement> findByGroupIdOrderByCreatedAtDesc(Long groupId);
}
