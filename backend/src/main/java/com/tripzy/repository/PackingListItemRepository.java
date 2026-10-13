package com.tripzy.repository;

import com.tripzy.entity.PackingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackingListItemRepository extends JpaRepository<PackingListItem, Long> {
    List<PackingListItem> findByPackingListId(Long packingListId);
}
