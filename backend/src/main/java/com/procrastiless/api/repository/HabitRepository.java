package com.procrastiless.api.repository;

import com.procrastiless.api.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserEmailOrderByIdAsc(String userEmail);
    Optional<Habit> findByIdAndUserEmail(Long id, String userEmail);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
