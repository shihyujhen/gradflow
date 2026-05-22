package com.procrastiless.api.dto;

import java.time.LocalDate;

public record WeeklySummaryResponse(
        LocalDate weekStart,
        LocalDate weekEnd,
        long added,
        long completed,
        long due
) {
}
