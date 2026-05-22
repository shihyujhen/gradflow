package com.procrastiless.api.dto;

import com.procrastiless.api.model.ArchivedTask;
import com.procrastiless.api.model.Task;
import com.procrastiless.api.model.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String name,
        String category,
        int priority,
        int effort,
        LocalDate deadline,
        Long goalId,
        TaskStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime archivedAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getName(),
                task.getCategory(),
                task.getPriority(),
                task.getEffort(),
                task.getDeadline(),
                task.getGoalId(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                null
        );
    }

    public static TaskResponse from(ArchivedTask task) {
        return new TaskResponse(
                task.getId(),
                task.getName(),
                task.getCategory(),
                task.getPriority(),
                task.getEffort(),
                task.getDeadline(),
                task.getGoalId(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getArchivedAt()
        );
    }
}
