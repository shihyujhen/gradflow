package com.procrastiless.api.controller;
import java.io.IOException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.procrastiless.api.service.S3Service;
import com.procrastiless.api.dto.GradFlowDtos.*;
import com.procrastiless.api.model.*;
import com.procrastiless.api.service.GeminiLogParserService;
import com.procrastiless.api.service.GradFlowService;
import com.procrastiless.api.service.ReminderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/gradflow")
@CrossOrigin(originPatterns = "${app.cors.allowed-origin}")
public class GradFlowController {
    private final S3Service s3Service;
    private final GradFlowService gradFlowService;
    private final GeminiLogParserService geminiLogParserService;
    private final ReminderService reminderService;

    public GradFlowController(GradFlowService gradFlowService, GeminiLogParserService geminiLogParserService, S3Service s3Service, ReminderService reminderService) {
        this.gradFlowService = gradFlowService;
        this.geminiLogParserService = geminiLogParserService;
	this.s3Service = s3Service;
        this.reminderService = reminderService;
    }

    @GetMapping("/daily-logs")
    public List<DailyLog> listDailyLogs(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.listDailyLogs(userEmail(email));
    }

    @PostMapping("/daily-logs")
    public DailyLog upsertDailyLog(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                   @Valid @RequestBody DailyLogRequest request) {
        return gradFlowService.upsertDailyLog(userEmail(email), request);
    }

    @DeleteMapping("/daily-logs/{id}")
    public void deleteDailyLog(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                               @PathVariable Long id) {
        gradFlowService.deleteDailyLog(userEmail(email), id);
    }

    @GetMapping("/habits")
    public List<HabitSummary> listHabits(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                         @RequestParam(required = false) LocalDate date) {
        return gradFlowService.habitSummaries(userEmail(email), date);
    }

    @GetMapping("/habits/{id}/stats")
    public HabitStats habitStats(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                 @PathVariable Long id) {
        return gradFlowService.habitStats(userEmail(email), id);
    }

    @PostMapping("/habits")
    public Habit createHabit(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                             @Valid @RequestBody HabitRequest request) {
        return gradFlowService.createHabit(userEmail(email), request);
    }

    @DeleteMapping("/habits/{id}")
    public void deleteHabit(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                            @PathVariable Long id) {
        gradFlowService.deleteHabit(userEmail(email), id);
    }

    @PostMapping("/habit-records")
    public HabitRecord upsertHabitRecord(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                         @Valid @RequestBody HabitRecordRequest request) {
        return gradFlowService.upsertHabitRecord(userEmail(email), request);
    }

    @GetMapping("/rewards")
    public List<RewardItem> listRewards(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.listRewards(userEmail(email));
    }

    @PostMapping("/rewards")
    public RewardItem createReward(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                   @Valid @RequestBody RewardRequest request) {
        return gradFlowService.createReward(userEmail(email), request);
    }

    @DeleteMapping("/rewards/{id}")
    public void deleteReward(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                             @PathVariable Long id) {
        gradFlowService.deleteReward(userEmail(email), id);
    }

    @PostMapping("/reward-redemptions")
    public RewardRedemption redeemReward(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                         @Valid @RequestBody RewardRedeemRequest request) {
        return gradFlowService.redeemReward(userEmail(email), request);
    }

    @GetMapping("/reward-summary")
    public RewardSummary rewardSummary(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.rewardSummary(userEmail(email));
    }

    @GetMapping("/expenses")
    public List<Expense> listExpenses(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.listExpenses(userEmail(email));
    }

    @PostMapping("/expenses")
    public Expense createExpense(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                 @Valid @RequestBody ExpenseRequest request) {
        return gradFlowService.createExpense(userEmail(email), request);
    }

    @DeleteMapping("/expenses/{id}")
    public void deleteExpense(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                              @PathVariable Long id) {
        gradFlowService.deleteExpense(userEmail(email), id);
    }

    @GetMapping("/research-logs")
    public List<ResearchLog> listResearchLogs(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.listResearchLogs(userEmail(email));
    }

    @PostMapping("/research-logs")
    public ResearchLog createResearchLog(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                         @Valid @RequestBody ResearchLogRequest request) {
        return gradFlowService.createResearchLog(userEmail(email), request);
    }

    @DeleteMapping("/research-logs/{id}")
    public void deleteResearchLog(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                  @PathVariable Long id) {
        gradFlowService.deleteResearchLog(userEmail(email), id);
    }

    @PatchMapping("/research-logs/{id}/solve/{item}")
    public ResearchLog solveResearchItem(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                         @PathVariable Long id,
                                         @PathVariable String item) {
        return gradFlowService.solveResearchItem(userEmail(email), id, item);
    }

    @GetMapping("/goals")
    public List<GoalSummary> listGoals(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.listGoals(userEmail(email));
    }

    @PostMapping("/goals")
    public Goal createGoal(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                           @Valid @RequestBody GoalRequest request) {
        return gradFlowService.createGoal(userEmail(email), request);
    }

    @DeleteMapping("/goals/{id}")
    public void deleteGoal(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                           @PathVariable Long id) {
        gradFlowService.deleteGoal(userEmail(email), id);
    }

    @GetMapping("/calendar-events")
    public List<CalendarEvent> listCalendarEvents(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                                  @RequestParam(required = false) LocalDate start,
                                                  @RequestParam(required = false) LocalDate end) {
        return gradFlowService.listCalendarEvents(userEmail(email), start, end);
    }

    @PostMapping("/calendar-events")
    public CalendarEvent createCalendarEvent(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                             @Valid @RequestBody CalendarEventRequest request) {
        return gradFlowService.createCalendarEvent(userEmail(email), request);
    }

    @DeleteMapping("/calendar-events/{id}")
    public void deleteCalendarEvent(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email,
                                    @PathVariable Long id) {
        gradFlowService.deleteCalendarEvent(userEmail(email), id);
    }

    @GetMapping("/analytics")
    public LifeAnalytics analytics(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return gradFlowService.analytics(userEmail(email));
    }

    @PostMapping("/ai/parse-log")
    public AiLogParseResponse parseLog(@RequestBody AiLogParseRequest request) {
        return geminiLogParserService.parse(request);
    }
    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file)
            throws IOException {

        return s3Service.uploadFile(file);
    }

    @PostMapping("/reminder")
    public ReminderResponse sendReminder(@RequestHeader(value = "X-User-Email", defaultValue = "demo@gradflow.local") String email) {
        return reminderService.sendDailyReminder(userEmail(email));
    }

    private String userEmail(String email) {
        return email == null || email.isBlank() ? "demo@gradflow.local" : email.trim().toLowerCase();
    }
}
