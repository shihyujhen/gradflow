package com.procrastiless.api.repository;

import com.procrastiless.api.model.Task;
import com.procrastiless.api.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByUserEmailOrderByIdAsc(String userEmail);
    List<Task> findByUserEmailAndStatus(String userEmail, TaskStatus status);
    Optional<Task> findByIdAndUserEmail(Long id, String userEmail);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
    void deleteByUserEmail(String userEmail);
}
