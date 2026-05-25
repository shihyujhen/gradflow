package com.procrastiless.api.service;

import com.procrastiless.api.dto.*;
import com.procrastiless.api.model.ArchivedTask;
import com.procrastiless.api.model.Task;
import com.procrastiless.api.model.TaskStatus;
import com.procrastiless.api.model.UserDataState;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class TaskService {
    private final UserDataStore userDataStore;

    public TaskService(UserDataStore userDataStore) {
        this.userDataStore = userDataStore;
    }

    public List<TaskResponse> listActiveTasks(String userEmail) {
        return userDataStore.load(userEmail).getTasks().stream()
                .sorted(Comparator.comparing(Task::getId))
                .map(TaskResponse::from)
                .toList();
    }

    public List<TaskResponse> listArchivedTasks(String userEmail) {
        return userDataStore.load(userEmail).getArchivedTasks().stream()
                .sorted(Comparator.comparing(ArchivedTask::getArchivedAt).reversed())
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse addTask(String userEmail, CreateTaskRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        Task task = new Task();
        task.setId(state.nextId("tasks"));
        task.setUserEmail(userEmail);
        task.setName(request.name().trim());
        task.setCategory(request.category());
        task.setPriority(request.priority());
        task.setEffort(request.effort());
        task.setDeadline(request.deadline());
        task.setGoalId(request.goalId());
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        state.getTasks().add(task);
        userDataStore.save(userEmail, state);
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse markDone(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        Task task = getTask(state, id);
        task.setStatus(TaskStatus.DONE);
        task.setUpdatedAt(LocalDateTime.now());
        userDataStore.save(userEmail, state);
        return TaskResponse.from(task);
    }

    @Transactional
    public void deleteTask(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        boolean removed = state.getTasks().removeIf(task -> Objects.equals(task.getId(), id));
        if (!removed) {
            throw new IllegalArgumentException("Task id not found.");
        }
        userDataStore.save(userEmail, state);
    }

    @Transactional
    public TaskResponse postpone(String userEmail, Long id, int days) {
        if (days == 0) {
            throw new IllegalArgumentException("Days must not be 0.");
        }

        UserDataState state = userDataStore.load(userEmail);
        Task task = getTask(state, id);
        if (task.getDeadline() == null) {
            throw new IllegalArgumentException("Task has no deadline to postpone.");
        }

        task.setDeadline(task.getDeadline().plusDays(days));
        task.setUpdatedAt(LocalDateTime.now());
        userDataStore.save(userEmail, state);
        return TaskResponse.from(task);
    }

    public List<SuggestionResponse> suggest(String userEmail, int top) {
        if (top <= 0) {
            throw new IllegalArgumentException("Top must be greater than 0.");
        }

        return userDataStore.load(userEmail).getTasks().stream()
                .filter(task -> task.getStatus() == TaskStatus.PENDING)
                .sorted(suggestionComparator())
                .limit(top)
                .map(this::toSuggestion)
                .toList();
    }

    @Transactional
    public ArchiveResponse archiveCompletedTasks(String userEmail) {
        UserDataState state = userDataStore.load(userEmail);
        List<Task> doneTasks = state.getTasks().stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .toList();
        if (doneTasks.isEmpty()) {
            return new ArchiveResponse(0, "No completed tasks to archive.");
        }

        LocalDateTime archivedAt = LocalDateTime.now();
        List<ArchivedTask> archivedTasks = doneTasks.stream()
                .map(task -> ArchivedTask.from(task, archivedAt))
                .toList();

        state.getArchivedTasks().addAll(archivedTasks);
        state.getTasks().removeIf(task -> task.getStatus() == TaskStatus.DONE);
        userDataStore.save(userEmail, state);
        return new ArchiveResponse(doneTasks.size(), "Archived " + doneTasks.size() + " tasks.");
    }

    @Transactional
    public void resetActiveTasks(String userEmail) {
        UserDataState state = userDataStore.load(userEmail);
        state.getTasks().clear();
        userDataStore.save(userEmail, state);
    }

    public StatsResponse stats(String userEmail) {
        List<Task> tasks = userDataStore.load(userEmail).getTasks();
        long total = tasks.size();
        long pending = tasks.stream().filter(task -> task.getStatus() == TaskStatus.PENDING).count();
        long done = tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
        double completionRate = total == 0 ? 0.0 : (double) done / total;
        long overdue = tasks.stream().filter(this::isOverdue).count();
        double averagePriority = total == 0 ? 0.0 : tasks.stream().mapToInt(Task::getPriority).average().orElse(0.0);
        double workloadScore = getWorkloadScore(tasks);

        return new StatsResponse(
                total,
                pending,
                done,
                completionRate,
                overdue,
                averagePriority,
                workloadScore,
                getWorkloadLevel(workloadScore),
                getWeeklySummary(tasks),
                getEvaluations(total, completionRate, overdue, workloadScore, pending)
        );
    }

    private Task getTask(UserDataState state, Long id) {
        return state.getTasks().stream()
                .filter(task -> Objects.equals(task.getId(), id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Task id not found."));
    }

    private Comparator<Task> suggestionComparator() {
        return Comparator
                .comparingInt(this::calculateScore).reversed()
                .thenComparing(Comparator.comparingInt((Task task) -> computeUrgency(task.getDeadline())).reversed())
                .thenComparing(Comparator.comparingInt(Task::getPriority).reversed())
                .thenComparing(Task::getEffort)
                .thenComparing(Task::getId);
    }

    private SuggestionResponse toSuggestion(Task task) {
        int urgency = computeUrgency(task.getDeadline());
        int score = calculateScore(task);
        String reason = "score=" + score + " (priority=" + task.getPriority()
                + ", urgency=" + urgency + ", effort=" + task.getEffort() + ")";
        return new SuggestionResponse(TaskResponse.from(task), score, urgency, reason);
    }

    private int calculateScore(Task task) {
        return task.getPriority() * 2 + computeUrgency(task.getDeadline()) - task.getEffort();
    }

    private int computeUrgency(LocalDate deadline) {
        if (deadline == null) {
            return 0;
        }

        long days = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
        if (days <= 0) return 5;
        if (days <= 1) return 4;
        if (days <= 3) return 3;
        if (days <= 7) return 2;
        return 0;
    }

    private boolean isOverdue(Task task) {
        return task.getStatus() == TaskStatus.PENDING
                && task.getDeadline() != null
                && task.getDeadline().isBefore(LocalDate.now());
    }

    private double getWorkloadScore(List<Task> tasks) {
        List<Task> pendingTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.PENDING)
                .toList();
        if (pendingTasks.isEmpty()) {
            return 0.0;
        }
        double averagePriority = pendingTasks.stream().mapToInt(Task::getPriority).average().orElse(0.0);
        return averagePriority * pendingTasks.size();
    }

    private String getWorkloadLevel(double workloadScore) {
        if (workloadScore < 10) return "Low";
        if (workloadScore <= 20) return "Medium";
        return "High";
    }

    private WeeklySummaryResponse getWeeklySummary(List<Task> tasks) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        long added = tasks.stream()
                .filter(task -> isInWeek(task.getCreatedAt().toLocalDate(), weekStart, weekEnd))
                .count();
        long completed = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .filter(task -> task.getUpdatedAt() != null)
                .filter(task -> isInWeek(task.getUpdatedAt().toLocalDate(), weekStart, weekEnd))
                .count();
        long due = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.PENDING)
                .filter(task -> task.getDeadline() != null)
                .filter(task -> isInWeek(task.getDeadline(), weekStart, weekEnd))
                .count();

        return new WeeklySummaryResponse(weekStart, weekEnd, added, completed, due);
    }

    private boolean isInWeek(LocalDate date, LocalDate weekStart, LocalDate weekEnd) {
        return !date.isBefore(weekStart) && !date.isAfter(weekEnd);
    }

    private List<String> getEvaluations(long total, double completionRate, long overdue, double workloadScore, long pending) {
        if (total == 0) {
            return List.of("No tasks yet. Add one small task to start building momentum.");
        }

        String completion = completionRate >= 0.7
                ? "Great completion rhythm. Keep protecting time for high-priority work."
                : completionRate >= 0.4
                ? "Progress is moving. Pick one high-score task and finish it before adding more."
                : "Completion is still low. Start with a low-effort pending task to reduce friction.";

        String deadline = overdue == 0
                ? "No overdue tasks. Your deadlines are under control."
                : overdue <= 2
                ? "A few tasks are overdue. Consider advancing them or reducing their scope."
                : "Many tasks are overdue. Re-check deadlines and split large tasks into smaller actions.";

        String workload = workloadScore > 20
                ? "Workload is high. Archive completed work and focus on the top recommendation."
                : workloadScore >= 10
                ? "Workload is moderate. A short planning pass can prevent deadline pressure."
                : "Workload is light. This is a good window to handle quick wins.";

        String pendingHint = pending > 0 && completionRate < 0.5
                ? "Tip: low-effort tasks are useful when procrastination is caused by task-start resistance."
                : "Tip: use the suggestion list when every task feels equally important.";

        return List.of(completion, deadline, workload, pendingHint);
    }
}
