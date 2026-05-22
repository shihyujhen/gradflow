package com.procrastiless.api.service;

import com.procrastiless.api.dto.GradFlowDtos.*;
import com.procrastiless.api.model.*;
import com.procrastiless.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GradFlowService {
    private final DailyLogRepository dailyLogRepository;
    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final HabitRecordRepository habitRecordRepository;
    private final ExpenseRepository expenseRepository;
    private final ResearchLogRepository researchLogRepository;
    private final GoalRepository goalRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final RewardItemRepository rewardItemRepository;
    private final RewardRedemptionRepository rewardRedemptionRepository;

    public GradFlowService(
            DailyLogRepository dailyLogRepository,
            TaskRepository taskRepository,
            HabitRepository habitRepository,
            HabitRecordRepository habitRecordRepository,
            ExpenseRepository expenseRepository,
            ResearchLogRepository researchLogRepository,
            GoalRepository goalRepository,
            CalendarEventRepository calendarEventRepository,
            RewardItemRepository rewardItemRepository,
            RewardRedemptionRepository rewardRedemptionRepository
    ) {
        this.dailyLogRepository = dailyLogRepository;
        this.taskRepository = taskRepository;
        this.habitRepository = habitRepository;
        this.habitRecordRepository = habitRecordRepository;
        this.expenseRepository = expenseRepository;
        this.researchLogRepository = researchLogRepository;
        this.goalRepository = goalRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.rewardItemRepository = rewardItemRepository;
        this.rewardRedemptionRepository = rewardRedemptionRepository;
    }

    public List<DailyLog> listDailyLogs(String userEmail) {
        return dailyLogRepository.findByUserEmailOrderByLogDateDesc(userEmail);
    }

    @Transactional
    public DailyLog upsertDailyLog(String userEmail, DailyLogRequest request) {
        DailyLog log = dailyLogRepository.findByUserEmailAndLogDate(userEmail, request.logDate()).orElseGet(DailyLog::new);
        log.setUserEmail(userEmail);
        log.setLogDate(request.logDate());
        log.setSleepStart(request.sleepStart());
        log.setWakeTime(request.wakeTime());
        log.setSleepHours(resolveSleepHours(request.sleepHours(), request.sleepStart(), request.wakeTime()));
        log.setMood(request.mood());
        log.setStress(request.stress());
        log.setStudyHours(request.studyHours());
        log.setWaterCups(request.waterCups());
        log.setWaterMl(request.waterMl());
        log.setExercised(request.exercised());
        log.setExerciseType(request.exerciseType());
        log.setExerciseMinutes(request.exerciseMinutes());
        log.setNote(request.note());
        log.setUpdatedAt(LocalDateTime.now());
        return dailyLogRepository.save(log);
    }

    @Transactional
    public void deleteDailyLog(String userEmail, Long id) {
        if (!dailyLogRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Daily log id not found.");
        }
        dailyLogRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    private double resolveSleepHours(double fallbackHours, LocalTime sleepStart, LocalTime wakeTime) {
        if (sleepStart == null || wakeTime == null) {
            return fallbackHours;
        }

        Duration duration = Duration.between(sleepStart, wakeTime);
        if (duration.isNegative() || duration.isZero()) {
            duration = duration.plusDays(1);
        }
        return Math.round((duration.toMinutes() / 60.0) * 10.0) / 10.0;
    }

    public Habit createHabit(String userEmail, HabitRequest request) {
        Habit habit = new Habit();
        habit.setUserEmail(userEmail);
        habit.setName(request.name().trim());
        habit.setTargetCount(request.targetCount());
        habit.setUnit(request.unit());
        habit.setIcon(request.icon() == null || request.icon().isBlank() ? "*" : request.icon());
        habit.setGoalId(request.goalId());
        return habitRepository.save(habit);
    }

    @Transactional
    public void deleteHabit(String userEmail, Long id) {
        if (!habitRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Habit id not found.");
        }
        habitRecordRepository.deleteByUserEmailAndHabitId(userEmail, id);
        habitRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    public List<HabitSummary> habitSummaries(String userEmail) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = weekStart();
        LocalDate weekEnd = weekEnd();
        List<HabitRecord> weeklyRecords = habitRecordRepository.findByUserEmailAndRecordDateBetween(userEmail, weekStart, weekEnd);

        return habitRepository.findByUserEmailOrderByIdAsc(userEmail).stream()
                .map(habit -> {
                    int todayCount = habitRecordRepository.findByUserEmailAndHabitIdAndRecordDate(userEmail, habit.getId(), today)
                            .map(HabitRecord::getCount)
                            .orElse(0);
                    long completedDays = weeklyRecords.stream()
                            .filter(record -> Objects.equals(record.getHabit().getId(), habit.getId()))
                            .filter(record -> record.getCount() >= habit.getTargetCount())
                            .count();
                    return new HabitSummary(
                            habit.getId(),
                            habit.getName(),
                            habit.getTargetCount(),
                            habit.getUnit(),
                            habit.getIcon(),
                            habit.getGoalId(),
                            todayCount,
                            completedDays / 7.0
                    );
                })
                .toList();
    }

    public HabitStats habitStats(String userEmail, Long id) {
        Habit habit = habitRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Habit id not found."));
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(27);
        List<HabitRecord> records = habitRecordRepository.findByUserEmail(userEmail).stream()
                .filter(record -> Objects.equals(record.getHabit().getId(), id))
                .toList();
        Set<LocalDate> completedDates = records.stream()
                .filter(record -> record.getCount() >= habit.getTargetCount())
                .map(HabitRecord::getRecordDate)
                .collect(Collectors.toSet());

        List<HabitDayStat> last14Days = new ArrayList<>();
        for (LocalDate date = today.minusDays(13); !date.isAfter(today); date = date.plusDays(1)) {
            last14Days.add(new HabitDayStat(date, completedDates.contains(date)));
        }

        List<HabitWeekStat> weeklyTrend = new ArrayList<>();
        LocalDate firstWeek = start.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        for (int week = 0; week < 4; week++) {
            LocalDate weekStartDate = firstWeek.plusWeeks(week);
            int completed = 0;
            for (int day = 0; day < 7; day++) {
                LocalDate date = weekStartDate.plusDays(day);
                if (!date.isAfter(today) && completedDates.contains(date)) {
                    completed++;
                }
            }
            weeklyTrend.add(new HabitWeekStat(weekStartDate, completed, 7));
        }

        LocalDate currentWeekStart = weekStart();
        int thisWeekCompleted = (int) completedDates.stream()
                .filter(date -> !date.isBefore(currentWeekStart) && !date.isAfter(today))
                .count();
        int thisWeekTotal = (int) (Duration.between(currentWeekStart.atStartOfDay(), today.plusDays(1).atStartOfDay()).toDays());
        double completionRate = last14Days.stream().filter(HabitDayStat::completed).count() / 14.0;
        int currentStreak = streakEndingAt(today, completedDates);
        int bestStreak = bestStreak(completedDates);

        return new HabitStats(
                habit.getId(),
                habit.getName(),
                habit.getIcon(),
                currentStreak,
                bestStreak,
                thisWeekCompleted,
                thisWeekTotal,
                completionRate,
                last14Days,
                weeklyTrend,
                habitSuggestion(completionRate, currentStreak)
        );
    }

    private int streakEndingAt(LocalDate date, Set<LocalDate> completedDates) {
        int streak = 0;
        LocalDate cursor = date;
        while (completedDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int bestStreak(Set<LocalDate> completedDates) {
        int best = 0;
        int current = 0;
        LocalDate previous = null;
        List<LocalDate> dates = completedDates.stream().sorted().toList();
        for (LocalDate date : dates) {
            current = previous != null && previous.plusDays(1).equals(date) ? current + 1 : 1;
            best = Math.max(best, current);
            previous = date;
        }
        return best;
    }

    private String habitSuggestion(double completionRate, int currentStreak) {
        if (completionRate >= 0.8) {
            return "This habit is stable. Keep the trigger the same and consider a tiny upgrade next week.";
        }
        if (currentStreak >= 3) {
            return "You have momentum. Protect the streak by making tomorrow's version easy to start.";
        }
        if (completionRate >= 0.45) {
            return "This habit is alive but uneven. Attach it to one fixed moment in the day.";
        }
        return "This habit may be too large right now. Shrink it for a week and rebuild consistency.";
    }

    public RewardItem createReward(String userEmail, RewardRequest request) {
        RewardItem reward = new RewardItem();
        reward.setUserEmail(userEmail);
        reward.setName(request.name().trim());
        reward.setIcon(request.icon() == null || request.icon().isBlank() ? "*" : request.icon());
        reward.setPointCost(request.pointCost());
        return rewardItemRepository.save(reward);
    }

    @Transactional
    public void deleteReward(String userEmail, Long id) {
        if (!rewardItemRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Reward id not found.");
        }
        rewardRedemptionRepository.deleteByUserEmailAndRewardId(userEmail, id);
        rewardItemRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    public List<RewardItem> listRewards(String userEmail) {
        return rewardItemRepository.findByUserEmailOrderByIdAsc(userEmail);
    }

    @Transactional
    public RewardRedemption redeemReward(String userEmail, RewardRedeemRequest request) {
        RewardItem reward = rewardItemRepository.findByIdAndUserEmail(request.rewardId(), userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Reward id not found."));
        RewardSummary summary = rewardSummary(userEmail);
        if (summary.currentPoints() < reward.getPointCost()) {
            throw new IllegalArgumentException("Not enough points for this reward.");
        }
        RewardRedemption redemption = new RewardRedemption();
        redemption.setUserEmail(userEmail);
        redemption.setReward(reward);
        redemption.setRedeemedDate(request.redeemedDate() == null ? LocalDate.now() : request.redeemedDate());
        redemption.setPointCost(reward.getPointCost());
        return rewardRedemptionRepository.save(redemption);
    }

    public RewardSummary rewardSummary(String userEmail) {
        int earned = earnedRewardPoints(userEmail);
        List<RewardRedemption> redemptions = rewardRedemptionRepository.findByUserEmailOrderByRedeemedDateDescIdDesc(userEmail);
        int redeemed = redemptions.stream().mapToInt(RewardRedemption::getPointCost).sum();
        return new RewardSummary(
                earned,
                redeemed,
                earned - redeemed,
                redemptions.stream().map(this::toRewardRedemptionSummary).toList()
        );
    }

    private int earnedRewardPoints(String userEmail) {
        return (int) habitRecordRepository.findByUserEmail(userEmail).stream()
                .filter(record -> record.getCount() >= record.getHabit().getTargetCount())
                .count();
    }

    private RewardRedemptionSummary toRewardRedemptionSummary(RewardRedemption redemption) {
        RewardItem reward = redemption.getReward();
        return new RewardRedemptionSummary(
                redemption.getId(),
                reward.getId(),
                reward.getName(),
                reward.getIcon(),
                redemption.getPointCost(),
                redemption.getRedeemedDate()
        );
    }

    @Transactional
    public HabitRecord upsertHabitRecord(String userEmail, HabitRecordRequest request) {
        Habit habit = habitRepository.findByIdAndUserEmail(request.habitId(), userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Habit id not found."));
        HabitRecord record = habitRecordRepository.findByUserEmailAndHabitIdAndRecordDate(userEmail, request.habitId(), request.recordDate())
                .orElseGet(HabitRecord::new);
        record.setUserEmail(userEmail);
        record.setHabit(habit);
        record.setRecordDate(request.recordDate());
        record.setCount(request.count());
        return habitRecordRepository.save(record);
    }

    public Expense createExpense(String userEmail, ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setUserEmail(userEmail);
        expense.setExpenseDate(request.expenseDate());
        expense.setCategory(request.category().trim());
        expense.setType(normalizeMoneyType(request.type()));
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(String userEmail, Long id) {
        if (!expenseRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Transaction id not found.");
        }
        expenseRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    private String normalizeMoneyType(String type) {
        if (type == null || type.isBlank()) {
            return "EXPENSE";
        }
        return "INCOME".equalsIgnoreCase(type) ? "INCOME" : "EXPENSE";
    }

    public List<Expense> listExpenses(String userEmail) {
        return expenseRepository.findByUserEmailOrderByExpenseDateDesc(userEmail);
    }

    public ResearchLog createResearchLog(String userEmail, ResearchLogRequest request) {
        ResearchLog log = new ResearchLog();
        log.setUserEmail(userEmail);
        log.setLogDate(request.logDate());
        log.setTopic(request.topic().trim());
        log.setProgress(request.progress());
        log.setBlockers(request.blockers());
        log.setNextStep(request.nextStep());
        log.setHours(request.hours());
        return researchLogRepository.save(log);
    }

    public List<ResearchLog> listResearchLogs(String userEmail) {
        return researchLogRepository.findByUserEmailOrderByLogDateDesc(userEmail);
    }

    @Transactional
    public void deleteResearchLog(String userEmail, Long id) {
        if (!researchLogRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Research log id not found.");
        }
        researchLogRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    @Transactional
    public ResearchLog solveResearchItem(String userEmail, Long id, String item) {
        ResearchLog log = researchLogRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Research log id not found."));
        if ("blocker".equalsIgnoreCase(item)) {
            log.setBlockerSolved(true);
        } else if ("next-step".equalsIgnoreCase(item) || "nextStep".equalsIgnoreCase(item)) {
            log.setNextStepSolved(true);
        } else {
            throw new IllegalArgumentException("Research item type is invalid.");
        }
        return researchLogRepository.save(log);
    }

    public Goal createGoal(String userEmail, GoalRequest request) {
        Goal goal = new Goal();
        goal.setUserEmail(userEmail);
        goal.setTitle(request.title().trim());
        goal.setCategory(request.category());
        goal.setTargetDate(request.targetDate());
        goal.setProgress(request.progress());
        goal.setCompleted(request.completed());
        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(String userEmail, Long id) {
        if (!goalRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Goal id not found.");
        }
        taskRepository.findByUserEmailOrderByIdAsc(userEmail).stream()
                .filter(task -> Objects.equals(task.getGoalId(), id))
                .forEach(task -> task.setGoalId(null));
        habitRepository.findByUserEmailOrderByIdAsc(userEmail).stream()
                .filter(habit -> Objects.equals(habit.getGoalId(), id))
                .forEach(habit -> habit.setGoalId(null));
        goalRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    public List<GoalSummary> listGoals(String userEmail) {
        List<Task> tasks = taskRepository.findByUserEmailOrderByIdAsc(userEmail);
        List<Habit> habits = habitRepository.findByUserEmailOrderByIdAsc(userEmail);
        List<HabitRecord> weeklyRecords = habitRecordRepository.findByUserEmailAndRecordDateBetween(userEmail, weekStart(), weekEnd());
        return goalRepository.findByUserEmailOrderByCompletedAscIdAsc(userEmail).stream()
                .map(goal -> toGoalSummary(goal, tasks, habits, weeklyRecords))
                .toList();
    }

    private GoalSummary toGoalSummary(Goal goal, List<Task> tasks, List<Habit> habits, List<HabitRecord> weeklyRecords) {
        List<Task> linkedTasks = tasks.stream()
                .filter(task -> Objects.equals(task.getGoalId(), goal.getId()))
                .toList();
        List<Habit> linkedHabits = habits.stream()
                .filter(habit -> Objects.equals(habit.getGoalId(), goal.getId()))
                .toList();
        int doneTasks = (int) linkedTasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
        double habitCompletion = linkedHabits.stream()
                .mapToDouble(habit -> weeklyHabitRate(habit, weeklyRecords))
                .sum();
        int linkedCount = linkedTasks.size() + linkedHabits.size();
        boolean auto = linkedCount > 0;
        int progress = auto
                ? (int) Math.round(((doneTasks + habitCompletion) / linkedCount) * 100)
                : goal.getProgress();
        progress = Math.max(0, Math.min(100, progress));
        return new GoalSummary(
                goal.getId(),
                goal.getTitle(),
                goal.getCategory(),
                goal.getTargetDate(),
                progress,
                goal.getProgress(),
                goal.isCompleted() || progress >= 100,
                auto,
                linkedTasks.size(),
                doneTasks,
                linkedHabits.size()
        );
    }

    private double weeklyHabitRate(Habit habit, List<HabitRecord> weeklyRecords) {
        long completedDays = weeklyRecords.stream()
                .filter(record -> Objects.equals(record.getHabit().getId(), habit.getId()))
                .filter(record -> record.getCount() >= habit.getTargetCount())
                .count();
        return Math.min(1.0, completedDays / 7.0);
    }

    public CalendarEvent createCalendarEvent(String userEmail, CalendarEventRequest request) {
        LocalDate startDate = request.startDate() == null ? request.eventDate() : request.startDate();
        if (startDate == null) {
            throw new IllegalArgumentException("Start date is required.");
        }
        LocalDate endDate = request.endDate() == null ? startDate : request.endDate();
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
        CalendarEvent event = new CalendarEvent();
        event.setUserEmail(userEmail);
        event.setTitle(request.title().trim());
        event.setEventDate(startDate);
        event.setStartDate(startDate);
        event.setEndDate(endDate);
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCategory(request.category());
        event.setNote(request.note());
        return calendarEventRepository.save(event);
    }

    @Transactional
    public void deleteCalendarEvent(String userEmail, Long id) {
        if (!calendarEventRepository.existsByIdAndUserEmail(id, userEmail)) {
            throw new IllegalArgumentException("Calendar event id not found.");
        }
        calendarEventRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    public List<CalendarEvent> listCalendarEvents(String userEmail, LocalDate start, LocalDate end) {
        if (start == null && end == null) {
            return calendarEventRepository.findByUserEmailOrderByStartDateAscStartTimeAsc(userEmail);
        }
        LocalDate today = LocalDate.now();
        LocalDate rangeStart = start == null ? today.withDayOfMonth(1) : start;
        LocalDate rangeEnd = end == null ? rangeStart.withDayOfMonth(rangeStart.lengthOfMonth()) : end;
        return calendarEventRepository.findOverlappingRange(userEmail, rangeStart, rangeEnd);
    }

    public LifeAnalytics analytics(String userEmail) {
        LocalDate start = weekStart();
        LocalDate end = weekEnd();

        List<DailyLog> dailyLogs = dailyLogRepository.findByUserEmailAndLogDateBetweenOrderByLogDateDesc(userEmail, start, end);
        List<Expense> expenses = expenseRepository.findByUserEmailAndExpenseDateBetweenOrderByExpenseDateDesc(userEmail, start, end);
        List<ResearchLog> researchLogs = researchLogRepository.findByUserEmailAndLogDateBetweenOrderByLogDateDesc(userEmail, start, end);
        List<HabitRecord> habitRecords = habitRecordRepository.findByUserEmailAndRecordDateBetween(userEmail, start, end);
        List<Goal> goals = goalRepository.findByUserEmailOrderByCompletedAscIdAsc(userEmail);

        double averageSleep = dailyLogs.stream().mapToDouble(DailyLog::getSleepHours).average().orElse(0.0);
        double averageMood = dailyLogs.stream().mapToInt(DailyLog::getMood).average().orElse(0.0);
        double averageStress = dailyLogs.stream().mapToInt(DailyLog::getStress).average().orElse(0.0);
        double totalStudyHours = dailyLogs.stream().mapToDouble(DailyLog::getStudyHours).sum();
        BigDecimal totalExpenses = expenses.stream()
                .filter(expense -> !"INCOME".equalsIgnoreCase(expense.getType()))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIncome = expenses.stream()
                .filter(expense -> "INCOME".equalsIgnoreCase(expense.getType()))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netCashFlow = totalIncome.subtract(totalExpenses);
        double totalResearchHours = researchLogs.stream().mapToDouble(ResearchLog::getHours).sum();
        int activeGoals = (int) goals.stream().filter(goal -> !goal.isCompleted()).count();
        int weeklyHabitCompletions = (int) habitRecords.stream()
                .filter(record -> record.getCount() >= record.getHabit().getTargetCount())
                .count();

        Map<String, BigDecimal> spendingByCategory = expenses.stream()
                .filter(expense -> !"INCOME".equalsIgnoreCase(expense.getType()))
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return new LifeAnalytics(
                averageSleep,
                averageMood,
                averageStress,
                totalStudyHours,
                totalExpenses,
                totalIncome,
                netCashFlow,
                totalResearchHours,
                activeGoals,
                weeklyHabitCompletions,
                buildInsights(averageSleep, averageMood, averageStress, totalStudyHours, totalResearchHours, totalExpenses, activeGoals),
                spendingByCategory
        );
    }

    private List<String> buildInsights(double sleep, double mood, double stress, double study, double research, BigDecimal expense, int activeGoals) {
        List<String> insights = new ArrayList<>();
        if (sleep > 0 && sleep < 6) {
            insights.add("Sleep is under 6 hours on average this week. Keep high-effort research tasks away from low-sleep days.");
        } else if (sleep >= 7) {
            insights.add("Sleep looks stable. This is a good week to schedule deeper research work.");
        }

        if (stress >= 4 && mood <= 3) {
            insights.add("Stress is high while mood is low. Prefer smaller tasks and reduce context switching.");
        }

        if (study < 8) {
            insights.add("Study time is still low this week. Add one short focus block to the calendar.");
        } else {
            insights.add("Study time is building up well. Review whether it is aligned with your main goals.");
        }

        if (research < 4) {
            insights.add("Research hours are light. Write one research log entry with a concrete next step.");
        }

        if (expense.compareTo(new BigDecimal("3000")) > 0) {
            insights.add("Spending is climbing this week. Check the expense categories before the weekend.");
        }

        if (activeGoals > 5) {
            insights.add("You have many active goals. Pick the top 3 so the system can stay actionable.");
        }

        if (insights.isEmpty()) {
            insights.add("Your weekly signals look balanced. Keep logging so the analysis gets more meaningful.");
        }
        return insights;
    }

    private LocalDate weekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private LocalDate weekEnd() {
        return LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
    }
}
