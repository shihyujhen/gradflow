package com.procrastiless.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.procrastiless.api.dto.GradFlowDtos.AiLogParseRequest;
import com.procrastiless.api.dto.GradFlowDtos.AiLogParseResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class GeminiLogParserService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiLogParserService(
            ObjectMapper objectMapper,
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.model}") String model
    ) {
        this.restClient = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com/v1beta").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public AiLogParseResponse parse(AiLogParseRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Gemini API key is not configured. Set GEMINI_API_KEY in the backend environment.");
        }

        String prompt = """
                You convert a student life note into GradFlow update actions.
                Return JSON only. The JSON keys must stay in English, but every human-readable value you write (the "summary" and "question" text) MUST be written in Traditional Chinese (繁體中文).
                Confirm schema:
                {"status":"confirm","summary":"用繁體中文寫的簡短確認","actions":[{"type":"dailyLog","date":"YYYY-MM-DD","fields":{}}]}
                Clarify schema:
                {"status":"clarify","question":"用繁體中文寫的一句追問","actions":[]}
                Allowed dailyLog fields: sleepStart, wakeTime, sleepHours, mood, stress, studyHours, waterMl, exercised, exerciseType, exerciseMinutes, note.
                Allowed habit action: {"type":"habitRecord","habitName":"name","date":"YYYY-MM-DD","count":1}.
                Today is %s.
                Existing habits: %s.
                Only create an action when an item in the note maps to an allowed dailyLog field or to one of the existing habits listed above; these are the only available categories.
                If part of the note does not relate to any allowed dailyLog field or existing habit, do NOT invent an action and do NOT force it into an unrelated field. Instead, in the Traditional Chinese summary, clearly state that you cannot add that item because there is no related category (例如：「無法新增『買新電腦』：找不到相關的類別」)。Still create actions for the parts that you can map.
                If the note is ambiguous, ask one follow-up question in Traditional Chinese instead of guessing.
                User note: %s
                """.formatted(request.today(), request.habits(), request.text());

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json")
        );

        JsonNode response;
        try {
            response = restClient.post()
                    .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException(readGeminiError(ex));
        }

        String raw = response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Gemini returned an empty response.");
        }
        try {
            return objectMapper.readValue(raw, AiLogParseResponse.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Gemini returned invalid JSON.");
        }
    }

    private String readGeminiError(RestClientResponseException ex) {
        try {
            JsonNode error = objectMapper.readTree(ex.getResponseBodyAsString()).path("error");
            String status = error.path("status").asText("Gemini request failed");
            String message = error.path("message").asText("Gemini request failed.");
            if (ex.getRawStatusCode() == 429) {
                return "Gemini quota/rate limit hit for model " + model + ". " + message;
            }
            return "Gemini API error (" + status + "): " + message;
        } catch (Exception ignored) {
            return "Gemini API error: " + ex.getStatusText();
        }
    }
}
