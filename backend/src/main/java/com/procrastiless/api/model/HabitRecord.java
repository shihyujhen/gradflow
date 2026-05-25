package com.procrastiless.api.model;

import java.time.LocalDate;

public class HabitRecord {
    private Long id;
    private Habit habit;

    private String userEmail = "demo@gradflow.local";
    private LocalDate recordDate;

    private int count;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
