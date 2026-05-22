package com.procrastiless.api.repository;

import com.procrastiless.api.model.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    Optional<DailyLog> findByLogDate(LocalDate logDate);
    List<DailyLog> findByLogDateBetweenOrderByLogDateDesc(LocalDate start, LocalDate end);
    List<DailyLog> findByUserEmailOrderByLogDateDesc(String userEmail);
    Optional<DailyLog> findByUserEmailAndLogDate(String userEmail, LocalDate logDate);
    List<DailyLog> findByUserEmailAndLogDateBetweenOrderByLogDateDesc(String userEmail, LocalDate start, LocalDate end);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
