package com.recipemanager.videoimport.application;

import com.recipemanager.videoimport.api.RecipeDraftResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Orchestrates the three-stage AI import pipeline:
 * download → transcribe → extract, and maps the result to a response DTO.
 */
@Service
public class VideoImportOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(VideoImportOrchestrator.class);

    private final VideoDownloader downloader;
    private final TranscriptionService transcriber;
    private final RecipeExtractionService extractor;
    private final ThumbnailFetcher thumbnailFetcher;

    public VideoImportOrchestrator(
            VideoDownloader downloader,
            TranscriptionService transcriber,
            RecipeExtractionService extractor,
            ThumbnailFetcher thumbnailFetcher) {
        this.downloader = downloader;
        this.transcriber = transcriber;
        this.extractor = extractor;
        this.thumbnailFetcher = thumbnailFetcher;
    }

    /**
     * Imports a recipe draft from the given source URL.
     * Exceptions from each stage propagate as-is (VideoDownloadException,
     * TranscriptionException, RecipeExtractionException), all of which extend
     * AppException and are handled by the global exception handler.
     */
    public RecipeDraftResponse importFromLink(String sourceUrl) {
        String source = detectSource(sourceUrl);
        log.info("Starting recipe import: source={} url={}", source, sourceUrl);

        log.debug("Fetching thumbnail");
        String imageUrl = thumbnailFetcher.fetchThumbnailUrl(sourceUrl);
        log.debug("Thumbnail resolved: {}", imageUrl);

        log.debug("Stage 1/3: downloading audio");
        Path audioFile = downloader.download(sourceUrl);
        log.debug("Stage 1/3: download complete path={}", audioFile);

        try {
            log.debug("Stage 2/3: transcribing audio");
            String transcript = transcriber.transcribe(audioFile);
            log.debug("Stage 2/3: transcription complete length={}", transcript.length());

            log.debug("Stage 3/3: extracting recipe from transcript");
            RecipeDraft draft = extractor.extract(transcript);
            log.info("Recipe import complete: title=\"{}\" source={}", draft.title(), source);

            return new RecipeDraftResponse(
                draft.title(),
                draft.description(),
                draft.ingredients(),
                draft.steps(),
                draft.cuisine(),
                draft.servings(),
                draft.prepTimeMinutes(),
                draft.cookTimeMinutes(),
                imageUrl,
                sourceUrl,
                source);
        } finally {
            deleteSilently(audioFile);
        }
    }

    private String detectSource(String url) {
        if (url.contains("youtube.com") || url.contains("youtu.be")) {
            return "youtube";
        }
        if (url.contains("facebook.com") || url.contains("fb.watch") || url.contains("fb.com")) {
            return "facebook";
        }
        return "web";
    }

    private void deleteSilently(Path path) {
        if (path == null) {
            return;
        }
        try {
            Files.deleteIfExists(path);
            Path parent = path.getParent();
            if (parent != null) {
                Files.deleteIfExists(parent);
            }
        } catch (IOException e) {
            log.warn("Failed to delete temp file {}: {}", path, e.getMessage());
        }
    }
}
