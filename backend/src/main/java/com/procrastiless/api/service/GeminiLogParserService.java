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
                Return JSON only.
                Confirm schema:
                {"status":"confirm","summary":"short confirmation","actions":[{"type":"dailyLog","date":"YYYY-MM-DD","fields":{}}]}
                Clarify schema:
                {"status":"clarify","question":"one concise follow-up question","actions":[]}
                Allowed dailyLog fields: sleepStart, wakeTime, sleepHours, mood, stress, studyHours, waterMl, exercised, exerciseType, exerciseMinutes, note.
                Allowed habit action: {"type":"habitRecord","habitName":"name","date":"YYYY-MM-DD","count":1}.
                Today is %s.
                Existing habits: %s.
                If the note is ambiguous, ask one follow-up question instead of guessing.
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
