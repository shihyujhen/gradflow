package com.procrastiless.api.model;

import java.time.LocalDate;

public class ResearchLog {
    private Long id;
    private LocalDate logDate;

    private String userEmail = "demo@gradflow.local";
    private String topic;
    private String progress;
    private String blockers;
    private String nextStep;

    private boolean blockerSolved;

    private boolean nextStepSolved;

    private double hours;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getProgress() { return progress; }
    public void setProgress(String progress) { this.progress = progress; }
    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }
    public String getNextStep() { return nextStep; }
    public void setNextStep(String nextStep) { this.nextStep = nextStep; }
    public boolean isBlockerSolved() { return blockerSolved; }
    public void setBlockerSolved(boolean blockerSolved) { this.blockerSolved = blockerSolved; }
    public boolean isNextStepSolved() { return nextStepSolved; }
    public void setNextStepSolved(boolean nextStepSolved) { this.nextStepSolved = nextStepSolved; }
    public double getHours() { return hours; }
    public void setHours(double hours) { this.hours = hours; }
}
