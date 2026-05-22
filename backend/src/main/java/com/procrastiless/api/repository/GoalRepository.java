package com.procrastiless.api.repository;

import com.procrastiless.api.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserEmailOrderByCompletedAscIdAsc(String userEmail);
    Optional<Goal> findByIdAndUserEmail(Long id, String userEmail);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
