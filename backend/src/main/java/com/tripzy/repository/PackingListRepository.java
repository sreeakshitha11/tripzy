package com.tripzy.repository;

import com.tripzy.entity.PackingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PackingListRepository extends JpaRepository<PackingList, Long> {
    List<PackingList> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PackingList> findByGroupId(Long groupId);
    Optional<PackingList> findByTripIdAndUserId(Long tripId, Long userId);
}
