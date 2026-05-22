package com.procrastiless.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reward_redemptions")
public class RewardRedemption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail = "demo@gradflow.local";

    @ManyToOne(optional = false)
    private RewardItem reward;

    @Column(nullable = false)
    private LocalDate redeemedDate;

    @Column(nullable = false)
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
