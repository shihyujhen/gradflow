package com.procrastiless.api.controller;

import com.procrastiless.api.dto.*;
import com.procrastiless.api.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "${app.cors.allowed-origin}")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/tasks")
    public List<TaskResponse> listTasks(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                        @RequestParam(defaultValue = "false") boolean archived) {
        String userEmail = userEmail(email);
        return archived ? taskService.listArchivedTasks(userEmail) : taskService.listActiveTasks(userEmail);
    }

    @PostMapping("/tasks")
    public TaskResponse addTask(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                @Valid @RequestBody CreateTaskRequest request) {
        return taskService.addTask(userEmail(email), request);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                           @PathVariable Long id) {
        taskService.deleteTask(userEmail(email), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/tasks/{id}/done")
    public TaskResponse markDone(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                 @PathVariable Long id) {
        return taskService.markDone(userEmail(email), id);
    }

    @PatchMapping("/tasks/{id}/postpone")
    public TaskResponse postpone(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                 @PathVariable Long id,
                                 @Valid @RequestBody PostponeRequest request) {
        return taskService.postpone(userEmail(email), id, request.days());
    }

    @GetMapping("/suggestions")
    public List<SuggestionResponse> suggest(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                            @RequestParam(defaultValue = "1") int top) {
        return taskService.suggest(userEmail(email), top);
    }

    @GetMapping("/stats")
    public StatsResponse stats(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return taskService.stats(userEmail(email));
    }

    @PostMapping("/archive")
    public ArchiveResponse archive(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return taskService.archiveCompletedTasks(userEmail(email));
    }

    @DeleteMapping("/tasks/reset")
    public ResponseEntity<Void> reset(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        taskService.resetActiveTasks(userEmail(email));
        return ResponseEntity.noContent().build();
    }

    private String userEmail(String email) {
        return email == null || email.isBlank() ? "demo@gradflow.local" : email.trim().toLowerCase();
    }
}
