package com.procrastiless.api.dto;

public record SuggestionResponse(
        TaskResponse task,
        int score,
        int urgency,
        String reason
) {
}
