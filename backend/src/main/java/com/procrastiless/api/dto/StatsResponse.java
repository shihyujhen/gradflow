package com.procrastiless.api.dto;

import java.util.List;

public record StatsResponse(
        long totalTasks,
        long pendingTasks,
        long doneTasks,
        double completionRate,
        long overdueTasks,
        double averagePriority,
        double workloadScore,
        String workloadLevel,
        WeeklySummaryResponse thisWeek,
        List<String> evaluations
) {
}
