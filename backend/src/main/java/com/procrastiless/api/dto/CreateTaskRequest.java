package com.procrastiless.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank String name,
        String category,
        @Min(1) @Max(5) int priority,
        @Min(1) @Max(5) int effort,
        LocalDate deadline,
        Long goalId
) {
}
