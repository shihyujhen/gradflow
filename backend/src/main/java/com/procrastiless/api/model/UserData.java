package com.procrastiless.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_data")
public class UserData {
    @Id
    @Column(nullable = false, length = 320)
    private String email;

    @Lob
    @Column(nullable = false, columnDefinition = "text")
    private String payload;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
