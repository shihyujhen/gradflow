package com.procrastiless.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class AuthDtos {
    public record AuthRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "must be at least 6 characters") String password
    ) {}

    public record PasswordChangeRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6, message = "must be at least 6 characters") String newPassword
    ) {}

    public record AuthResponse(String email, LocalDateTime createdAt) {}
}
