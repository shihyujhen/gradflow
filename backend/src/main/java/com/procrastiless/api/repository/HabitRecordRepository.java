package com.procrastiless.api.repository;

import com.procrastiless.api.model.HabitRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitRecordRepository extends JpaRepository<HabitRecord, Long> {
    List<HabitRecord> findByRecordDateBetween(LocalDate start, LocalDate end);
    Optional<HabitRecord> findByHabitIdAndRecordDate(Long habitId, LocalDate recordDate);
    void deleteByHabitId(Long habitId);
    List<HabitRecord> findByUserEmail(String userEmail);
    List<HabitRecord> findByUserEmailAndRecordDateBetween(String userEmail, LocalDate start, LocalDate end);
    Optional<HabitRecord> findByUserEmailAndHabitIdAndRecordDate(String userEmail, Long habitId, LocalDate recordDate);
    void deleteByUserEmailAndHabitId(String userEmail, Long habitId);
}
