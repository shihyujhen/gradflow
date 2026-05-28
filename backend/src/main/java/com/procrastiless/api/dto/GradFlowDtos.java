package com.procrastiless.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public class GradFlowDtos {
    public record DailyLogRequest(
            @NotNull LocalDate logDate,
            @DecimalMin("0.0") @DecimalMax("24.0") double sleepHours,
            LocalTime sleepStart,
            LocalTime wakeTime,
            @Min(1) @Max(5) int mood,
            @Min(1) @Max(5) int stress,
            @DecimalMin("0.0") double studyHours,
            @Min(0) int waterCups,
            @Min(0) int waterMl,
            boolean exercised,
            String exerciseType,
            @Min(0) int exerciseMinutes,
            String note
    ) {}

    public record HabitRequest(@NotBlank String name, @Min(1) int targetCount, String unit, String icon, Long goalId) {}
    public record HabitRecordRequest(@NotNull Long habitId, @NotNull LocalDate recordDate, @Min(0) int count) {}
    public record HabitDayStat(LocalDate date, boolean completed) {}
    public record HabitWeekStat(LocalDate weekStart, int completed, int total) {}
    public record HabitStats(
            Long habitId,
            String name,
            String icon,
            int currentStreak,
            int bestStreak,
            int thisWeekCompleted,
            int thisWeekTotal,
            double completionRate,
            List<HabitDayStat> last14Days,
            List<HabitWeekStat> weeklyTrend,
            String suggestion
    ) {}
    public record RewardRequest(@NotBlank String name, String icon, @Min(1) int pointCost) {}
    public record RewardRedeemRequest(@NotNull Long rewardId, LocalDate redeemedDate) {}

    public record ExpenseRequest(
            @NotNull LocalDate expenseDate,
            @NotBlank String category,
            String type,
            @NotNull @DecimalMin("0.0") BigDecimal amount,
            String description
    ) {}

    public record ResearchLogRequest(
            @NotNull LocalDate logDate,
            @NotBlank String topic,
            String progress,
            String blockers,
            String nextStep,
            @DecimalMin("0.0") double hours
    ) {}

    public record GoalRequest(
            @NotBlank String title,
            String category,
            LocalDate targetDate,
            @Min(0) @Max(100) int progress,
            boolean completed
    ) {}

    public record CalendarEventRequest(
            @NotBlank String title,
            LocalDate eventDate,
            LocalDate startDate,
            LocalDate endDate,
            LocalTime startTime,
            LocalTime endTime,
            String category,
            String note
    ) {}

    public record HabitSummary(Long id, String name, int targetCount, String unit, String icon, Long goalId, int todayCount, double weeklyRate) {}
    public record GoalSummary(Long id, String title, String category, LocalDate targetDate, int progress, int manualProgress, boolean completed, boolean autoProgress, int linkedTasks, int doneTasks, int linkedHabits) {}
    public record RewardRedemptionSummary(Long id, Long rewardId, String name, String icon, int pointCost, LocalDate redeemedDate) {}
    public record RewardSummary(int earnedPoints, int redeemedPoints, int currentPoints, List<RewardRedemptionSummary> redemptions) {}

    public record LifeAnalytics(
            double averageSleep,
            double averageMood,
            double averageStress,
            double totalStudyHours,
            BigDecimal totalExpenses,
            BigDecimal totalIncome,
            BigDecimal netCashFlow,
            double totalResearchHours,
            int activeGoals,
            int weeklyHabitCompletions,
            List<String> insights,
            Map<String, BigDecimal> spendingByCategory
    ) {}

    public record AiHabitContext(Long id, String name, int targetCount) {}
    public record AiLogParseRequest(String text, LocalDate today, List<AiHabitContext> habits) {}
    public record AiLogParseResponse(String status, String summary, String question, List<Map<String, Object>> actions) {}

    public record ReminderResponse(boolean sent, String recipient, String message) {}
}
