package com.procrastiless.api.repository;

import com.procrastiless.api.model.RewardItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RewardItemRepository extends JpaRepository<RewardItem, Long> {
    List<RewardItem> findByUserEmailOrderByIdAsc(String userEmail);
    Optional<RewardItem> findByIdAndUserEmail(Long id, String userEmail);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
