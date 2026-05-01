package com.recipemanager.videoimport.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recipemanager.common.exception.RecipeExtractionException;
import com.recipemanager.common.exception.TranscriptionException;
import com.recipemanager.common.exception.VideoDownloadException;
import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import com.recipemanager.videoimport.api.RecipeDraftResponse;
import com.recipemanager.videoimport.application.ThumbnailFetcher;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VideoImportOrchestratorTest {

    @Mock
    private VideoDownloader downloader;

    @Mock
    private TranscriptionService transcriber;

    @Mock
    private RecipeExtractionService extractor;

    @Mock
    private ThumbnailFetcher thumbnailFetcher;

    private VideoImportOrchestrator orchestrator;

    @BeforeEach
    void setup() {
        orchestrator = new VideoImportOrchestrator(downloader, transcriber, extractor, thumbnailFetcher);
    }

    @Test
    void importFromLinkSucceedsAndReturnsDraft() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        String sourceUrl = "https://www.youtube.com/watch?v=test123";
        RecipeDraft draft = buildDraft();

        when(thumbnailFetcher.fetchThumbnailUrl(sourceUrl))
            .thenReturn("https://img.youtube.com/vi/test123/maxresdefault.jpg");
        when(downloader.download(sourceUrl)).thenReturn(tempFile);
        when(transcriber.transcribe(tempFile)).thenReturn("Transcript text");
        when(extractor.extract("Transcript text")).thenReturn(draft);

        RecipeDraftResponse response = orchestrator.importFromLink(sourceUrl);

        assertEquals("Test Recipe", response.title());
        assertEquals(sourceUrl, response.sourceUrl());
        assertEquals("youtube", response.source());
        assertEquals("https://img.youtube.com/vi/test123/maxresdefault.jpg", response.imageUrl());
        assertEquals(1, response.ingredients().size());
        assertEquals(1, response.steps().size());
    }

    @Test
    void importFromLinkPropagatesDownloadException() {
        String sourceUrl = "https://invalid-url.com/video";
        when(downloader.download(sourceUrl)).thenThrow(new VideoDownloadException("download failed"));

        assertThrows(VideoDownloadException.class, () -> orchestrator.importFromLink(sourceUrl));
    }

    @Test
    void importFromLinkPropagatesTranscriptionException() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        String sourceUrl = "https://www.youtube.com/watch?v=test";

        when(downloader.download(sourceUrl)).thenReturn(tempFile);
        when(transcriber.transcribe(any(Path.class)))
            .thenThrow(new TranscriptionException("transcription failed"));

        assertThrows(TranscriptionException.class, () -> orchestrator.importFromLink(sourceUrl));
    }

    @Test
    void importFromLinkPropagatesExtractionException() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        String sourceUrl = "https://www.youtube.com/watch?v=test";

        when(downloader.download(sourceUrl)).thenReturn(tempFile);
        when(transcriber.transcribe(any(Path.class))).thenReturn("Transcript");
        when(extractor.extract(anyString()))
            .thenThrow(new RecipeExtractionException("extraction failed"));

        assertThrows(RecipeExtractionException.class, () -> orchestrator.importFromLink(sourceUrl));
    }

    @Test
    void importFromLinkDeletesTempFileAfterSuccess() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        assertTrue(Files.exists(tempFile));
        String sourceUrl = "https://youtu.be/abc";

        when(downloader.download(sourceUrl)).thenReturn(tempFile);
        when(transcriber.transcribe(tempFile)).thenReturn("Transcript");
        when(extractor.extract(anyString())).thenReturn(buildDraft());

        orchestrator.importFromLink(sourceUrl);

        assertTrue(Files.notExists(tempFile), "Temp audio file should be deleted after import");
    }

    @Test
    void importFromLinkDeletesTempFileAfterFailure() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        assertTrue(Files.exists(tempFile));
        String sourceUrl = "https://www.youtube.com/watch?v=fail";

        when(downloader.download(sourceUrl)).thenReturn(tempFile);
        when(transcriber.transcribe(tempFile)).thenThrow(new TranscriptionException("fail"));

        assertThrows(TranscriptionException.class, () -> orchestrator.importFromLink(sourceUrl));
        assertTrue(Files.notExists(tempFile), "Temp audio file should be deleted even after failure");
    }

    @Test
    void detectsYouTubeSource() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        when(downloader.download(anyString())).thenReturn(tempFile);
        when(transcriber.transcribe(any())).thenReturn("text");
        when(extractor.extract(anyString())).thenReturn(buildDraft());

        RecipeDraftResponse response = orchestrator.importFromLink("https://youtu.be/xyz");
        assertEquals("youtube", response.source());
    }

    @Test
    void detectsFacebookSource() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        when(downloader.download(anyString())).thenReturn(tempFile);
        when(transcriber.transcribe(any())).thenReturn("text");
        when(extractor.extract(anyString())).thenReturn(buildDraft());

        RecipeDraftResponse response = orchestrator.importFromLink("https://www.facebook.com/watch?v=123");
        assertEquals("facebook", response.source());
    }

    @Test
    void detectsFbWatchSource() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        when(downloader.download(anyString())).thenReturn(tempFile);
        when(transcriber.transcribe(any())).thenReturn("text");
        when(extractor.extract(anyString())).thenReturn(buildDraft());

        RecipeDraftResponse response = orchestrator.importFromLink("https://fb.watch/abcXYZ123/");
        assertEquals("facebook", response.source());
    }

    @Test
    void detectsWebSourceForNonYouTube() throws IOException {
        Path tempFile = Files.createTempFile("test-audio", ".mp3");
        when(downloader.download(anyString())).thenReturn(tempFile);
        when(transcriber.transcribe(any())).thenReturn("text");
        when(extractor.extract(anyString())).thenReturn(buildDraft());

        RecipeDraftResponse response = orchestrator.importFromLink("https://food-blog.com/recipe");
        assertEquals("web", response.source());
    }

    private RecipeDraft buildDraft() {
        return new RecipeDraft(
            "Test Recipe",
            "A test description",
            List.of(new Ingredient("Flour", "2", "cups")),
            List.of(new Step(1, "Mix ingredients")),
            "Italian",
            4,
            15,
            30);
    }
}
