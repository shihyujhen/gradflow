package com.procrastiless.api.model;


public class Habit {
    private Long id;
    private String name;

    private String userEmail = "demo@gradflow.local";
    private int targetCount;

    private String unit;

    private String icon;

    private Long goalId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public int getTargetCount() { return targetCount; }
    public void setTargetCount(int targetCount) { this.targetCount = targetCount; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Long getGoalId() { return goalId; }
    public void setGoalId(Long goalId) { this.goalId = goalId; }
}
