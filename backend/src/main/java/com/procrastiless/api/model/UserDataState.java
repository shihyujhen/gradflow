package com.procrastiless.api.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserDataState {
    private List<Task> tasks = new ArrayList<>();
    private List<ArchivedTask> archivedTasks = new ArrayList<>();
    private List<DailyLog> dailyLogs = new ArrayList<>();
    private List<Habit> habits = new ArrayList<>();
    private List<HabitRecord> habitRecords = new ArrayList<>();
    private List<Expense> expenses = new ArrayList<>();
    private List<ResearchLog> researchLogs = new ArrayList<>();
    private List<Goal> goals = new ArrayList<>();
    private List<CalendarEvent> calendarEvents = new ArrayList<>();
    private List<RewardItem> rewardItems = new ArrayList<>();
    private List<RewardRedemption> rewardRedemptions = new ArrayList<>();
    private Map<String, Long> nextIds = new HashMap<>();

    public long nextId(String bucket) {
        long id = nextIds.getOrDefault(bucket, 0L) + 1L;
        nextIds.put(bucket, id);
        return id;
    }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks == null ? new ArrayList<>() : tasks; }
    public List<ArchivedTask> getArchivedTasks() { return archivedTasks; }
    public void setArchivedTasks(List<ArchivedTask> archivedTasks) { this.archivedTasks = archivedTasks == null ? new ArrayList<>() : archivedTasks; }
    public List<DailyLog> getDailyLogs() { return dailyLogs; }
    public void setDailyLogs(List<DailyLog> dailyLogs) { this.dailyLogs = dailyLogs == null ? new ArrayList<>() : dailyLogs; }
    public List<Habit> getHabits() { return habits; }
    public void setHabits(List<Habit> habits) { this.habits = habits == null ? new ArrayList<>() : habits; }
    public List<HabitRecord> getHabitRecords() { return habitRecords; }
    public void setHabitRecords(List<HabitRecord> habitRecords) { this.habitRecords = habitRecords == null ? new ArrayList<>() : habitRecords; }
    public List<Expense> getExpenses() { return expenses; }
    public void setExpenses(List<Expense> expenses) { this.expenses = expenses == null ? new ArrayList<>() : expenses; }
    public List<ResearchLog> getResearchLogs() { return researchLogs; }
    public void setResearchLogs(List<ResearchLog> researchLogs) { this.researchLogs = researchLogs == null ? new ArrayList<>() : researchLogs; }
    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals == null ? new ArrayList<>() : goals; }
    public List<CalendarEvent> getCalendarEvents() { return calendarEvents; }
    public void setCalendarEvents(List<CalendarEvent> calendarEvents) { this.calendarEvents = calendarEvents == null ? new ArrayList<>() : calendarEvents; }
    public List<RewardItem> getRewardItems() { return rewardItems; }
    public void setRewardItems(List<RewardItem> rewardItems) { this.rewardItems = rewardItems == null ? new ArrayList<>() : rewardItems; }
    public List<RewardRedemption> getRewardRedemptions() { return rewardRedemptions; }
    public void setRewardRedemptions(List<RewardRedemption> rewardRedemptions) { this.rewardRedemptions = rewardRedemptions == null ? new ArrayList<>() : rewardRedemptions; }
    public Map<String, Long> getNextIds() { return nextIds; }
    public void setNextIds(Map<String, Long> nextIds) { this.nextIds = nextIds == null ? new HashMap<>() : nextIds; }
}
