package com.procrastiless.api.model;

import java.time.LocalDate;

public class RewardRedemption {
    private Long id;

    private String userEmail = "demo@gradflow.local";
    private RewardItem reward;
    private LocalDate redeemedDate;
    private int pointCost;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public RewardItem getReward() { return reward; }
    public void setReward(RewardItem reward) { this.reward = reward; }
    public LocalDate getRedeemedDate() { return redeemedDate; }
    public void setRedeemedDate(LocalDate redeemedDate) { this.redeemedDate = redeemedDate; }
    public int getPointCost() { return pointCost; }
    public void setPointCost(int pointCost) { this.pointCost = pointCost; }
}
