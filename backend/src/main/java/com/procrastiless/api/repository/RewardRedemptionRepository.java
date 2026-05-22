package com.procrastiless.api.repository;

import com.procrastiless.api.model.RewardRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {
    List<RewardRedemption> findByRedeemedDateBetweenOrderByRedeemedDateDesc(LocalDate start, LocalDate end);
    void deleteByRewardId(Long rewardId);
    List<RewardRedemption> findByUserEmailOrderByRedeemedDateDescIdDesc(String userEmail);
    List<RewardRedemption> findByUserEmailAndRedeemedDateBetweenOrderByRedeemedDateDesc(String userEmail, LocalDate start, LocalDate end);
    void deleteByUserEmailAndRewardId(String userEmail, Long rewardId);
}
