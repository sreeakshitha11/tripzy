package com.tripzy.repository;

import com.tripzy.entity.GroupPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupPollRepository extends JpaRepository<GroupPoll, Long> {
    List<GroupPoll> findByGroupIdOrderByCreatedAtDesc(Long groupId);
}
