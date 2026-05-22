package com.procrastiless.api.repository;

import com.procrastiless.api.model.ArchivedTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArchivedTaskRepository extends JpaRepository<ArchivedTask, Long> {
    List<ArchivedTask> findByUserEmailOrderByArchivedAtDesc(String userEmail);
}
