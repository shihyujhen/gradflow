package com.procrastiless.api.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class DailyLog {
    private Long id;
    private LocalDate logDate;

    private String userEmail = "demo@gradflow.local";

    private double sleepHours;
    private LocalTime sleepStart;
    private LocalTime wakeTime;
    private int mood;
    private int stress;
    private double studyHours;
    private int waterCups;
    private int waterMl;
    private boolean exercised;
    private String exerciseType;
    private int exerciseMinutes;
    private String note;

    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public double getSleepHours() { return sleepHours; }
    public void setSleepHours(double sleepHours) { this.sleepHours = sleepHours; }
    public LocalTime getSleepStart() { return sleepStart; }
    public void setSleepStart(LocalTime sleepStart) { this.sleepStart = sleepStart; }
    public LocalTime getWakeTime() { return wakeTime; }
    public void setWakeTime(LocalTime wakeTime) { this.wakeTime = wakeTime; }
    public int getMood() { return mood; }
    public void setMood(int mood) { this.mood = mood; }
    public int getStress() { return stress; }
    public void setStress(int stress) { this.stress = stress; }
    public double getStudyHours() { return studyHours; }
    public void setStudyHours(double studyHours) { this.studyHours = studyHours; }
    public int getWaterCups() { return waterCups; }
    public void setWaterCups(int waterCups) { this.waterCups = waterCups; }
    public int getWaterMl() { return waterMl; }
    public void setWaterMl(int waterMl) { this.waterMl = waterMl; }
    public boolean isExercised() { return exercised; }
    public void setExercised(boolean exercised) { this.exercised = exercised; }
    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }
    public int getExerciseMinutes() { return exerciseMinutes; }
    public void setExerciseMinutes(int exerciseMinutes) { this.exerciseMinutes = exerciseMinutes; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
