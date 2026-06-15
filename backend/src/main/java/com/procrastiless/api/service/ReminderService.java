package com.procrastiless.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.procrastiless.api.dto.GradFlowDtos.ReminderResponse;
import com.procrastiless.api.model.CalendarEvent;
import com.procrastiless.api.model.Goal;
import com.procrastiless.api.model.Task;
import com.procrastiless.api.model.TaskStatus;
import com.procrastiless.api.model.UserDataState;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReminderService {
    private final UserDataStore userDataStore;
    private final GradFlowService gradFlowService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${app.reminder.lambda-url}")
    private String lambdaUrl;

    public ReminderService(UserDataStore userDataStore, GradFlowService gradFlowService, ObjectMapper objectMapper) {
        this.userDataStore = userDataStore;
        this.gradFlowService = gradFlowService;
        this.objectMapper = objectMapper;
    }

    public ReminderResponse sendDailyReminder(String email) {
        Map<String, Object> payload = buildPayload(email);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(lambdaUrl))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                return new ReminderResponse(false, email,
                        "Reminder service returned status " + response.statusCode() + ".");
            }
            return new ReminderResponse(true, email, "Reminder sent to " + email + ".");
        } catch (Exception e) {
            return new ReminderResponse(false, email, "Reminder failed: " + e.getMessage());
        }
    }

    private Map<String, Object> buildPayload(String email) {
        UserDataState state = userDataStore.load(email);
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(7);

        List<Map<String, Object>> upcomingDeadlines = state.getTasks().stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .filter(task -> task.getDeadline() != null
                        && !task.getDeadline().isBefore(today)
                        && !task.getDeadline().isAfter(horizon))
                .sorted(Comparator.comparing(Task::getDeadline))
                .map(task -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("name", task.getName());
                    entry.put("category", task.getCategory());
                    entry.put("priority", task.getPriority());
                    entry.put("deadline", task.getDeadline().toString());
                    return entry;
                })
                .toList();

        List<Map<String, Object>> todayEvents = state.getCalendarEvents().stream()
                .filter(event -> !event.getStartDate().isAfter(today) && !event.getEndDate().isBefore(today))
                .map(event -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("title", event.getTitle());
                    entry.put("category", event.getCategory());
                    entry.put("startTime", event.getStartTime() == null ? null : event.getStartTime().toString());
                    return entry;
                })
                .toList();

        List<Map<String, Object>> activeGoals = state.getGoals().stream()
                .filter(goal -> !goal.isCompleted())
                .sorted(Comparator.comparing(Goal::getTargetDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(goal -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("title", goal.getTitle());
                    entry.put("category", goal.getCategory());
                    entry.put("progress", goal.getProgress());
                    entry.put("targetDate", goal.getTargetDate() == null ? null : goal.getTargetDate().toString());
                    return entry;
                })
                .toList();

        long pendingTaskCount = state.getTasks().stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("email", email);
        payload.put("name", email.contains("@") ? email.substring(0, email.indexOf('@')) : email);
        payload.put("generatedAt", OffsetDateTime.now().toString());
        payload.put("pendingTaskCount", pendingTaskCount);
        payload.put("upcomingDeadlines", upcomingDeadlines);
        payload.put("todayEvents", todayEvents);
        payload.put("activeGoals", activeGoals);
        payload.put("analytics", gradFlowService.analytics(email));
        return payload;
    }
}
