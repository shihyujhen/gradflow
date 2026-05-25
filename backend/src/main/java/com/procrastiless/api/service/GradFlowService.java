package com.procrastiless.api.service;

import com.procrastiless.api.dto.GradFlowDtos.*;
import com.procrastiless.api.model.*;
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
    private final UserDataStore userDataStore;

    public GradFlowService(UserDataStore userDataStore) {
        this.userDataStore = userDataStore;
    }

    public List<DailyLog> listDailyLogs(String userEmail) {
        return userDataStore.load(userEmail).getDailyLogs().stream()
                .sorted(Comparator.comparing(DailyLog::getLogDate).reversed())
                .toList();
    }

    @Transactional
    public DailyLog upsertDailyLog(String userEmail, DailyLogRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        DailyLog log = state.getDailyLogs().stream()
                .filter(item -> Objects.equals(item.getLogDate(), request.logDate()))
                .findFirst()
                .orElseGet(() -> {
                    DailyLog created = new DailyLog();
                    created.setId(state.nextId("dailyLogs"));
                    state.getDailyLogs().add(created);
                    return created;
                });
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
        userDataStore.save(userEmail, state);
        return log;
    }

    @Transactional
    public void deleteDailyLog(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getDailyLogs(), id, "Daily log id not found.");
        userDataStore.save(userEmail, state);
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
        UserDataState state = userDataStore.load(userEmail);
        Habit habit = new Habit();
        habit.setId(state.nextId("habits"));
        habit.setUserEmail(userEmail);
        habit.setName(request.name().trim());
        habit.setTargetCount(request.targetCount());
        habit.setUnit(request.unit());
        habit.setIcon(request.icon() == null || request.icon().isBlank() ? "\u2728" : request.icon());
        habit.setGoalId(request.goalId());
        state.getHabits().add(habit);
        userDataStore.save(userEmail, state);
        return habit;
    }

    @Transactional
    public void deleteHabit(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getHabits(), id, "Habit id not found.");
        state.getHabitRecords().removeIf(record -> Objects.equals(record.getHabit().getId(), id));
        userDataStore.save(userEmail, state);
    }

    public List<HabitSummary> habitSummaries(String userEmail) {
        UserDataState state = userDataStore.load(userEmail);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = weekStart();
        LocalDate weekEnd = weekEnd();
        List<HabitRecord> weeklyRecords = state.getHabitRecords().stream()
                .filter(record -> inRange(record.getRecordDate(), weekStart, weekEnd))
                .toList();

        return state.getHabits().stream()
                .sorted(Comparator.comparing(Habit::getId))
                .map(habit -> {
                    int todayCount = state.getHabitRecords().stream()
                            .filter(record -> Objects.equals(record.getHabit().getId(), habit.getId()))
                            .filter(record -> Objects.equals(record.getRecordDate(), today))
                            .map(HabitRecord::getCount)
                            .findFirst()
                            .orElse(0);
                    long completedDays = weeklyRecords.stream()
                            .filter(record -> Objects.equals(record.getHabit().getId(), habit.getId()))
                            .filter(record -> record.getCount() >= habit.getTargetCount())
                            .count();
                    return new HabitSummary(habit.getId(), habit.getName(), habit.getTargetCount(), habit.getUnit(), habit.getIcon(), habit.getGoalId(), todayCount, completedDays / 7.0);
                })
                .toList();
    }

    public HabitStats habitStats(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        Habit habit = findById(state.getHabits(), id, "Habit id not found.");
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(27);
        List<HabitRecord> records = state.getHabitRecords().stream()
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
        int thisWeekCompleted = (int) completedDates.stream().filter(date -> !date.isBefore(currentWeekStart) && !date.isAfter(today)).count();
        int thisWeekTotal = (int) (Duration.between(currentWeekStart.atStartOfDay(), today.plusDays(1).atStartOfDay()).toDays());
        double completionRate = last14Days.stream().filter(HabitDayStat::completed).count() / 14.0;
        int currentStreak = streakEndingAt(today, completedDates);
        int bestStreak = bestStreak(completedDates);

        return new HabitStats(habit.getId(), habit.getName(), habit.getIcon(), currentStreak, bestStreak, thisWeekCompleted, thisWeekTotal, completionRate, last14Days, weeklyTrend, habitSuggestion(completionRate, currentStreak));
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
        for (LocalDate date : completedDates.stream().sorted().toList()) {
            current = previous != null && previous.plusDays(1).equals(date) ? current + 1 : 1;
            best = Math.max(best, current);
            previous = date;
        }
        return best;
    }

    private String habitSuggestion(double completionRate, int currentStreak) {
        if (completionRate >= 0.8) return "This habit is stable. Keep the trigger the same and consider a tiny upgrade next week.";
        if (currentStreak >= 3) return "You have momentum. Protect the streak by making tomorrow's version easy to start.";
        if (completionRate >= 0.45) return "This habit is alive but uneven. Attach it to one fixed moment in the day.";
        return "This habit may be too large right now. Shrink it for a week and rebuild consistency.";
    }

    public RewardItem createReward(String userEmail, RewardRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        RewardItem reward = new RewardItem();
        reward.setId(state.nextId("rewardItems"));
        reward.setUserEmail(userEmail);
        reward.setName(request.name().trim());
        reward.setIcon(request.icon() == null || request.icon().isBlank() ? "\u2728" : request.icon());
        reward.setPointCost(request.pointCost());
        state.getRewardItems().add(reward);
        userDataStore.save(userEmail, state);
        return reward;
    }

    @Transactional
    public void deleteReward(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getRewardItems(), id, "Reward id not found.");
        state.getRewardRedemptions().removeIf(redemption -> Objects.equals(redemption.getReward().getId(), id));
        userDataStore.save(userEmail, state);
    }

    public List<RewardItem> listRewards(String userEmail) {
        return userDataStore.load(userEmail).getRewardItems().stream()
                .sorted(Comparator.comparing(RewardItem::getId))
                .toList();
    }

    @Transactional
    public RewardRedemption redeemReward(String userEmail, RewardRedeemRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        RewardItem reward = findById(state.getRewardItems(), request.rewardId(), "Reward id not found.");
        RewardSummary summary = rewardSummary(state);
        if (summary.currentPoints() < reward.getPointCost()) {
            throw new IllegalArgumentException("Not enough points for this reward.");
        }
        RewardRedemption redemption = new RewardRedemption();
        redemption.setId(state.nextId("rewardRedemptions"));
        redemption.setUserEmail(userEmail);
        redemption.setReward(reward);
        redemption.setRedeemedDate(request.redeemedDate() == null ? LocalDate.now() : request.redeemedDate());
        redemption.setPointCost(reward.getPointCost());
        state.getRewardRedemptions().add(redemption);
        userDataStore.save(userEmail, state);
        return redemption;
    }

    public RewardSummary rewardSummary(String userEmail) {
        return rewardSummary(userDataStore.load(userEmail));
    }

    private RewardSummary rewardSummary(UserDataState state) {
        int earned = (int) state.getHabitRecords().stream()
                .filter(record -> record.getCount() >= record.getHabit().getTargetCount())
                .count();
        List<RewardRedemption> redemptions = state.getRewardRedemptions().stream()
                .sorted(Comparator.comparing(RewardRedemption::getRedeemedDate).reversed().thenComparing(Comparator.comparing(RewardRedemption::getId).reversed()))
                .toList();
        int redeemed = redemptions.stream().mapToInt(RewardRedemption::getPointCost).sum();
        return new RewardSummary(earned, redeemed, earned - redeemed, redemptions.stream().map(this::toRewardRedemptionSummary).toList());
    }

    private RewardRedemptionSummary toRewardRedemptionSummary(RewardRedemption redemption) {
        RewardItem reward = redemption.getReward();
        return new RewardRedemptionSummary(redemption.getId(), reward.getId(), reward.getName(), reward.getIcon(), redemption.getPointCost(), redemption.getRedeemedDate());
    }

    @Transactional
    public HabitRecord upsertHabitRecord(String userEmail, HabitRecordRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        Habit habit = findById(state.getHabits(), request.habitId(), "Habit id not found.");
        HabitRecord record = state.getHabitRecords().stream()
                .filter(item -> Objects.equals(item.getHabit().getId(), request.habitId()))
                .filter(item -> Objects.equals(item.getRecordDate(), request.recordDate()))
                .findFirst()
                .orElseGet(() -> {
                    HabitRecord created = new HabitRecord();
                    created.setId(state.nextId("habitRecords"));
                    state.getHabitRecords().add(created);
                    return created;
                });
        record.setUserEmail(userEmail);
        record.setHabit(habit);
        record.setRecordDate(request.recordDate());
        record.setCount(request.count());
        userDataStore.save(userEmail, state);
        return record;
    }

    public Expense createExpense(String userEmail, ExpenseRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        Expense expense = new Expense();
        expense.setId(state.nextId("expenses"));
        expense.setUserEmail(userEmail);
        expense.setExpenseDate(request.expenseDate());
        expense.setCategory(request.category().trim());
        expense.setType(normalizeMoneyType(request.type()));
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        state.getExpenses().add(expense);
        userDataStore.save(userEmail, state);
        return expense;
    }

    @Transactional
    public void deleteExpense(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getExpenses(), id, "Transaction id not found.");
        userDataStore.save(userEmail, state);
    }

    private String normalizeMoneyType(String type) {
        if (type == null || type.isBlank()) return "EXPENSE";
        return "INCOME".equalsIgnoreCase(type) ? "INCOME" : "EXPENSE";
    }

    public List<Expense> listExpenses(String userEmail) {
        return userDataStore.load(userEmail).getExpenses().stream()
                .sorted(Comparator.comparing(Expense::getExpenseDate).reversed())
                .toList();
    }

    public ResearchLog createResearchLog(String userEmail, ResearchLogRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        ResearchLog log = new ResearchLog();
        log.setId(state.nextId("researchLogs"));
        log.setUserEmail(userEmail);
        log.setLogDate(request.logDate());
        log.setTopic(request.topic().trim());
        log.setProgress(request.progress());
        log.setBlockers(request.blockers());
        log.setNextStep(request.nextStep());
        log.setHours(request.hours());
        state.getResearchLogs().add(log);
        userDataStore.save(userEmail, state);
        return log;
    }

    public List<ResearchLog> listResearchLogs(String userEmail) {
        return userDataStore.load(userEmail).getResearchLogs().stream()
                .sorted(Comparator.comparing(ResearchLog::getLogDate).reversed())
                .toList();
    }

    @Transactional
    public void deleteResearchLog(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getResearchLogs(), id, "Research log id not found.");
        userDataStore.save(userEmail, state);
    }

    @Transactional
    public ResearchLog solveResearchItem(String userEmail, Long id, String item) {
        UserDataState state = userDataStore.load(userEmail);
        ResearchLog log = findById(state.getResearchLogs(), id, "Research log id not found.");
        if ("blocker".equalsIgnoreCase(item)) {
            log.setBlockerSolved(true);
        } else if ("next-step".equalsIgnoreCase(item) || "nextStep".equalsIgnoreCase(item)) {
            log.setNextStepSolved(true);
        } else {
            throw new IllegalArgumentException("Research item type is invalid.");
        }
        userDataStore.save(userEmail, state);
        return log;
    }

    public Goal createGoal(String userEmail, GoalRequest request) {
        UserDataState state = userDataStore.load(userEmail);
        Goal goal = new Goal();
        goal.setId(state.nextId("goals"));
        goal.setUserEmail(userEmail);
        goal.setTitle(request.title().trim());
        goal.setCategory(request.category());
        goal.setTargetDate(request.targetDate());
        goal.setProgress(request.progress());
        goal.setCompleted(request.completed());
        state.getGoals().add(goal);
        userDataStore.save(userEmail, state);
        return goal;
    }

    @Transactional
    public void deleteGoal(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getGoals(), id, "Goal id not found.");
        state.getTasks().stream().filter(task -> Objects.equals(task.getGoalId(), id)).forEach(task -> task.setGoalId(null));
        state.getHabits().stream().filter(habit -> Objects.equals(habit.getGoalId(), id)).forEach(habit -> habit.setGoalId(null));
        userDataStore.save(userEmail, state);
    }

    public List<GoalSummary> listGoals(String userEmail) {
        UserDataState state = userDataStore.load(userEmail);
        List<HabitRecord> weeklyRecords = state.getHabitRecords().stream()
                .filter(record -> inRange(record.getRecordDate(), weekStart(), weekEnd()))
                .toList();
        return state.getGoals().stream()
                .sorted(Comparator.comparing(Goal::isCompleted).thenComparing(Goal::getId))
                .map(goal -> toGoalSummary(goal, state.getTasks(), state.getHabits(), weeklyRecords))
                .toList();
    }

    private GoalSummary toGoalSummary(Goal goal, List<Task> tasks, List<Habit> habits, List<HabitRecord> weeklyRecords) {
        List<Task> linkedTasks = tasks.stream().filter(task -> Objects.equals(task.getGoalId(), goal.getId())).toList();
        List<Habit> linkedHabits = habits.stream().filter(habit -> Objects.equals(habit.getGoalId(), goal.getId())).toList();
        int doneTasks = (int) linkedTasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
        double habitCompletion = linkedHabits.stream().mapToDouble(habit -> weeklyHabitRate(habit, weeklyRecords)).sum();
        int linkedCount = linkedTasks.size() + linkedHabits.size();
        boolean auto = linkedCount > 0;
        int progress = auto ? (int) Math.round(((doneTasks + habitCompletion) / linkedCount) * 100) : goal.getProgress();
        progress = Math.max(0, Math.min(100, progress));
        return new GoalSummary(goal.getId(), goal.getTitle(), goal.getCategory(), goal.getTargetDate(), progress, goal.getProgress(), goal.isCompleted() || progress >= 100, auto, linkedTasks.size(), doneTasks, linkedHabits.size());
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
        if (startDate == null) throw new IllegalArgumentException("Start date is required.");
        LocalDate endDate = request.endDate() == null ? startDate : request.endDate();
        if (endDate.isBefore(startDate)) throw new IllegalArgumentException("End date cannot be before start date.");
        UserDataState state = userDataStore.load(userEmail);
        CalendarEvent event = new CalendarEvent();
        event.setId(state.nextId("calendarEvents"));
        event.setUserEmail(userEmail);
        event.setTitle(request.title().trim());
        event.setEventDate(startDate);
        event.setStartDate(startDate);
        event.setEndDate(endDate);
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCategory(request.category());
        event.setNote(request.note());
        state.getCalendarEvents().add(event);
        userDataStore.save(userEmail, state);
        return event;
    }

    @Transactional
    public void deleteCalendarEvent(String userEmail, Long id) {
        UserDataState state = userDataStore.load(userEmail);
        removeById(state.getCalendarEvents(), id, "Calendar event id not found.");
        userDataStore.save(userEmail, state);
    }

    public List<CalendarEvent> listCalendarEvents(String userEmail, LocalDate start, LocalDate end) {
        List<CalendarEvent> events = userDataStore.load(userEmail).getCalendarEvents();
        if (start == null && end == null) {
            return events.stream()
                    .sorted(Comparator.comparing(CalendarEvent::getStartDate).thenComparing(event -> Optional.ofNullable(event.getStartTime()).orElse(LocalTime.MIN)))
                    .toList();
        }
        LocalDate today = LocalDate.now();
        LocalDate rangeStart = start == null ? today.withDayOfMonth(1) : start;
        LocalDate rangeEnd = end == null ? rangeStart.withDayOfMonth(rangeStart.lengthOfMonth()) : end;
        return events.stream()
                .filter(event -> !event.getStartDate().isAfter(rangeEnd) && !event.getEndDate().isBefore(rangeStart))
                .sorted(Comparator.comparing(CalendarEvent::getStartDate).thenComparing(event -> Optional.ofNullable(event.getStartTime()).orElse(LocalTime.MIN)))
                .toList();
    }

    public LifeAnalytics analytics(String userEmail) {
        UserDataState state = userDataStore.load(userEmail);
        LocalDate start = weekStart();
        LocalDate end = weekEnd();

        List<DailyLog> dailyLogs = state.getDailyLogs().stream().filter(log -> inRange(log.getLogDate(), start, end)).toList();
        List<Expense> expenses = state.getExpenses().stream().filter(expense -> inRange(expense.getExpenseDate(), start, end)).toList();
        List<ResearchLog> researchLogs = state.getResearchLogs().stream().filter(log -> inRange(log.getLogDate(), start, end)).toList();
        List<HabitRecord> habitRecords = state.getHabitRecords().stream().filter(record -> inRange(record.getRecordDate(), start, end)).toList();

        double averageSleep = dailyLogs.stream().mapToDouble(DailyLog::getSleepHours).average().orElse(0.0);
        double averageMood = dailyLogs.stream().mapToInt(DailyLog::getMood).average().orElse(0.0);
        double averageStress = dailyLogs.stream().mapToInt(DailyLog::getStress).average().orElse(0.0);
        double totalStudyHours = dailyLogs.stream().mapToDouble(DailyLog::getStudyHours).sum();
        BigDecimal totalExpenses = expenses.stream().filter(expense -> !"INCOME".equalsIgnoreCase(expense.getType())).map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIncome = expenses.stream().filter(expense -> "INCOME".equalsIgnoreCase(expense.getType())).map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netCashFlow = totalIncome.subtract(totalExpenses);
        double totalResearchHours = researchLogs.stream().mapToDouble(ResearchLog::getHours).sum();
        int activeGoals = (int) state.getGoals().stream().filter(goal -> !goal.isCompleted()).count();
        int weeklyHabitCompletions = (int) habitRecords.stream().filter(record -> record.getCount() >= record.getHabit().getTargetCount()).count();

        Map<String, BigDecimal> spendingByCategory = expenses.stream()
                .filter(expense -> !"INCOME".equalsIgnoreCase(expense.getType()))
                .collect(Collectors.groupingBy(Expense::getCategory, Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        return new LifeAnalytics(averageSleep, averageMood, averageStress, totalStudyHours, totalExpenses, totalIncome, netCashFlow, totalResearchHours, activeGoals, weeklyHabitCompletions, buildInsights(averageSleep, averageMood, averageStress, totalStudyHours, totalResearchHours, totalExpenses, activeGoals), spendingByCategory);
    }

    private List<String> buildInsights(double sleep, double mood, double stress, double study, double research, BigDecimal expense, int activeGoals) {
        List<String> insights = new ArrayList<>();
        if (sleep > 0 && sleep < 6) insights.add("Sleep is under 6 hours on average this week. Keep high-effort research tasks away from low-sleep days.");
        else if (sleep >= 7) insights.add("Sleep looks stable. This is a good week to schedule deeper research work.");
        if (stress >= 4 && mood <= 3) insights.add("Stress is high while mood is low. Prefer smaller tasks and reduce context switching.");
        if (study < 8) insights.add("Study time is still low this week. Add one short focus block to the calendar.");
        else insights.add("Study time is building up well. Review whether it is aligned with your main goals.");
        if (research < 4) insights.add("Research hours are light. Write one research log entry with a concrete next step.");
        if (expense.compareTo(new BigDecimal("3000")) > 0) insights.add("Spending is climbing this week. Check the expense categories before the weekend.");
        if (activeGoals > 5) insights.add("You have many active goals. Pick the top 3 so the system can stay actionable.");
        if (insights.isEmpty()) insights.add("Your weekly signals look balanced. Keep logging so the analysis gets more meaningful.");
        return insights;
    }

    private LocalDate weekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private LocalDate weekEnd() {
        return LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
    }

    private boolean inRange(LocalDate date, LocalDate start, LocalDate end) {
        return date != null && !date.isBefore(start) && !date.isAfter(end);
    }

    private <T> T findById(List<T> items, Long id, String message) {
        return items.stream()
                .filter(item -> Objects.equals(idOf(item), id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(message));
    }

    private <T> void removeById(List<T> items, Long id, String message) {
        boolean removed = items.removeIf(item -> Objects.equals(idOf(item), id));
        if (!removed) {
            throw new IllegalArgumentException(message);
        }
    }

    private Long idOf(Object item) {
        if (item instanceof DailyLog value) return value.getId();
        if (item instanceof Habit value) return value.getId();
        if (item instanceof Expense value) return value.getId();
        if (item instanceof ResearchLog value) return value.getId();
        if (item instanceof Goal value) return value.getId();
        if (item instanceof CalendarEvent value) return value.getId();
        if (item instanceof RewardItem value) return value.getId();
        throw new IllegalArgumentException("Unsupported id lookup.");
    }
}
