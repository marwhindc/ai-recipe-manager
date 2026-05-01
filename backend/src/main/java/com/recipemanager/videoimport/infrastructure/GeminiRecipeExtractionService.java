package com.recipemanager.videoimport.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipemanager.common.exception.RecipeExtractionException;
import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import com.recipemanager.videoimport.application.RecipeDraft;
import com.recipemanager.videoimport.application.RecipeExtractionService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Extracts a structured recipe from a transcript using the Gemini Generative Language API.
 * Requires GEMINI_API_KEY to be set via the {@code app.videoimport.gemini-api-key} property
 * or the {@code GEMINI_API_KEY} environment variable.
 */
@Component
public class GeminiRecipeExtractionService implements RecipeExtractionService {

    private static final Logger log = LoggerFactory.getLogger(GeminiRecipeExtractionService.class);

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=";

    private static final String EXTRACTION_PROMPT = """
        Extract a recipe from the following transcript or web content.
        Return ONLY a JSON object with exactly these fields:
          title (string),
          description (string or null),
          cuisine (string or null),
          servings (integer — estimate from ingredient volumes or typical serving sizes; only null if there is genuinely no basis for any guess),
          prepTimeMinutes (integer — estimate from the preparation steps described; only null if truly indeterminate),
          cookTimeMinutes (integer — estimate from cooking steps and techniques described; only null if truly indeterminate),
          ingredients (array of {name: string, quantity: string, unit: string}),
          steps (array of {order: integer, instruction: string}).
        For servings, prepTimeMinutes, and cookTimeMinutes: make a reasonable estimate rather than returning null — use context clues such as ingredient quantities, cooking techniques, and the number of steps described. Return null only when there is genuinely no information to base any estimate on.
        Do not include any extra text or markdown.

        Transcript/Content:
        """;

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiRecipeExtractionService(
            @Value("${app.videoimport.gemini-api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    }

    @Override
    public RecipeDraft extract(String transcript) {
        if (!StringUtils.hasText(apiKey)) {
            throw new RecipeExtractionException(
                "Gemini API key is not configured (set GEMINI_API_KEY)");
        }
        try {
            log.info("Sending transcript to Gemini for extraction: transcriptLength={}", transcript.length());
            String requestBody = buildRequest(transcript);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_URL + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(60))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API returned status {}: {}", response.statusCode(), response.body());
                throw new RecipeExtractionException(
                    "Gemini API returned status " + response.statusCode());
            }

            RecipeDraft draft = parseResponse(response.body());
            log.info("Recipe extracted by Gemini: title=\"{}\" ingredients={} steps={}",
                draft.title(),
                draft.ingredients() == null ? 0 : draft.ingredients().size(),
                draft.steps() == null ? 0 : draft.steps().size());
            return draft;

        } catch (RecipeExtractionException e) {
            throw e;
        } catch (Exception e) {
            throw new RecipeExtractionException("Recipe extraction failed: " + e.getMessage());
        }
    }

    private String buildRequest(String transcript) throws Exception {
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", EXTRACTION_PROMPT + transcript))
            )),
            "generationConfig", Map.of("responseMimeType", "application/json")
        );
        return objectMapper.writeValueAsString(body);
    }

    private RecipeDraft parseResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String recipeJson = root
            .path("candidates")
            .path(0)
            .path("content")
            .path("parts")
            .path(0)
            .path("text")
            .asText();

        if (recipeJson.isBlank()) {
            throw new RecipeExtractionException("Gemini returned an empty recipe JSON");
        }

        GeminiRecipeData data = objectMapper.readValue(recipeJson, GeminiRecipeData.class);

        List<Ingredient> ingredients = data.ingredients() == null ? List.of()
            : data.ingredients().stream()
                .map(i -> new Ingredient(i.name(), i.quantity(), i.unit()))
                .toList();

        List<Step> steps = data.steps() == null ? List.of()
            : data.steps().stream()
                .map(s -> new Step(s.order(), s.instruction()))
                .toList();

        return new RecipeDraft(
            data.title(),
            data.description(),
            ingredients,
            steps,
            data.cuisine(),
            data.servings(),
            data.prepTimeMinutes(),
            data.cookTimeMinutes());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GeminiRecipeData(
        String title,
        String description,
        String cuisine,
        Integer servings,
        Integer prepTimeMinutes,
        Integer cookTimeMinutes,
        List<IngredientData> ingredients,
        List<StepData> steps
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record IngredientData(String name, String quantity, String unit) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record StepData(Integer order, String instruction) {}
}
