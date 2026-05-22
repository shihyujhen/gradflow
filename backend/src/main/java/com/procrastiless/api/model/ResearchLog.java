package com.procrastiless.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "research_logs")
public class ResearchLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate logDate;

    private String userEmail = "demo@gradflow.local";

    @Column(nullable = false)
    private String topic;

    @Column(length = 2000)
    private String progress;

    @Column(length = 2000)
    private String blockers;

    @Column(length = 2000)
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
