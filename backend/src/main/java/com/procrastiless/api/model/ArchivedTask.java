package com.procrastiless.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "archived_tasks")
public class ArchivedTask {
    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    private String userEmail = "demo@gradflow.local";

    private String category;

    @Column(nullable = false)
    private int priority;

    @Column(nullable = false)
    private int effort;

    private LocalDate deadline;

    private Long goalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private LocalDateTime archivedAt;

    public static ArchivedTask from(Task task, LocalDateTime archivedAt) {
        ArchivedTask archivedTask = new ArchivedTask();
        archivedTask.setId(task.getId());
        archivedTask.setName(task.getName());
        archivedTask.setUserEmail(task.getUserEmail());
        archivedTask.setCategory(task.getCategory());
        archivedTask.setPriority(task.getPriority());
        archivedTask.setEffort(task.getEffort());
        archivedTask.setDeadline(task.getDeadline());
        archivedTask.setGoalId(task.getGoalId());
        archivedTask.setStatus(task.getStatus());
        archivedTask.setCreatedAt(task.getCreatedAt());
        archivedTask.setUpdatedAt(task.getUpdatedAt());
        archivedTask.setArchivedAt(archivedAt);
        return archivedTask;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    public int getEffort() { return effort; }
    public void setEffort(int effort) { this.effort = effort; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDateTime archivedAt) { this.archivedAt = archivedAt; }
}
