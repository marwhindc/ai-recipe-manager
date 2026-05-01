package com.recipemanager.videoimport.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipemanager.common.exception.TranscriptionException;
import com.recipemanager.videoimport.application.TranscriptionService;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Transcribes audio files using the AssemblyAI REST API.
 * Requires ASSEMBLYAI_API_KEY to be set via the {@code app.videoimport.assemblyai-api-key}
 * property or the {@code ASSEMBLYAI_API_KEY} environment variable.
 */
@Component
public class AssemblyAiTranscriptionService implements TranscriptionService {

    private static final Logger log = LoggerFactory.getLogger(AssemblyAiTranscriptionService.class);

    private static final String BASE_URL = "https://api.assemblyai.com/v2";
    private static final int POLL_MAX_ATTEMPTS = 60;
    private static final long POLL_INTERVAL_MS = 5_000;

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AssemblyAiTranscriptionService(
            @Value("${app.videoimport.assemblyai-api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    }

    @Override
    public String transcribe(Path audioFile) {
        if (!StringUtils.hasText(apiKey)) {
            throw new TranscriptionException(
                "AssemblyAI API key is not configured (set ASSEMBLYAI_API_KEY)");
        }
        try {
            String uploadUrl = uploadAudio(audioFile);
            String transcriptId = createTranscript(uploadUrl);
            return pollForTranscript(transcriptId);
        } catch (TranscriptionException e) {
            throw e;
        } catch (Exception e) {
            throw new TranscriptionException("Transcription failed: " + e.getMessage());
        }
    }

    private String uploadAudio(Path audioFile) throws IOException, InterruptedException {
        byte[] audioBytes = Files.readAllBytes(audioFile);
        log.info("Uploading audio to AssemblyAI: size={}B", audioBytes.length);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/upload"))
            .header("Authorization", apiKey)
            .header("Content-Type", "application/octet-stream")
            .POST(HttpRequest.BodyPublishers.ofByteArray(audioBytes))
            .timeout(Duration.ofMinutes(5))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new TranscriptionException(
                "AssemblyAI upload failed with status " + response.statusCode());
        }

        JsonNode json = objectMapper.readTree(response.body());
        String uploadUrl = json.path("upload_url").asText();
        log.debug("Audio uploaded: upload_url={}", uploadUrl);
        return uploadUrl;
    }

    private String createTranscript(String uploadUrl) throws IOException, InterruptedException {
        String body = objectMapper.writeValueAsString(
            new HashMap<>(Map.of("audio_url", uploadUrl)));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/transcript"))
            .header("Authorization", apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .timeout(Duration.ofSeconds(30))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new TranscriptionException(
                "AssemblyAI transcript creation failed with status " + response.statusCode());
        }

        JsonNode json = objectMapper.readTree(response.body());
        String transcriptId = json.path("id").asText();
        log.info("AssemblyAI transcript job created: id={}", transcriptId);
        return transcriptId;
    }

    private String pollForTranscript(String transcriptId) throws IOException, InterruptedException {
        for (int attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/transcript/" + transcriptId))
                .header("Authorization", apiKey)
                .GET()
                .timeout(Duration.ofSeconds(30))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new TranscriptionException(
                    "AssemblyAI poll failed with status " + response.statusCode());
            }

            JsonNode json = objectMapper.readTree(response.body());
            String status = json.path("status").asText();
            log.debug("AssemblyAI poll attempt={} status={}", attempt + 1, status);

            if ("completed".equals(status)) {
                String text = json.path("text").asText();
                log.info("Transcription complete: id={} length={}", transcriptId, text.length());
                return text;
            } else if ("error".equals(status)) {
                log.error("AssemblyAI transcription error: id={} error={}", transcriptId, json.path("error").asText());
                throw new TranscriptionException(
                    "AssemblyAI transcription error: " + json.path("error").asText());
            }

            Thread.sleep(POLL_INTERVAL_MS);
        }

        throw new TranscriptionException(
            "Transcription timed out after " + POLL_MAX_ATTEMPTS + " polling attempts");
    }
}
