package com.procrastiless.api.repository;

import com.procrastiless.api.model.ResearchLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ResearchLogRepository extends JpaRepository<ResearchLog, Long> {
    List<ResearchLog> findByLogDateBetweenOrderByLogDateDesc(LocalDate start, LocalDate end);
    List<ResearchLog> findByUserEmailOrderByLogDateDesc(String userEmail);
    List<ResearchLog> findByUserEmailAndLogDateBetweenOrderByLogDateDesc(String userEmail, LocalDate start, LocalDate end);
    Optional<ResearchLog> findByIdAndUserEmail(Long id, String userEmail);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
