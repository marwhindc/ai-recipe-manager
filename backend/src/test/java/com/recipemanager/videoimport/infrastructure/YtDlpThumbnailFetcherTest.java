package com.recipemanager.videoimport.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class YtDlpThumbnailFetcherTest {

    private YtDlpThumbnailFetcher fetcher;

    @BeforeEach
    void setup() {
        fetcher = new YtDlpThumbnailFetcher("yt-dlp");
    }

    @Test
    void youtubeWatchUrlResolvesMaxresThumbnail() {
        String result = fetcher.fetchThumbnailUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        assertEquals("https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", result);
    }

    @Test
    void youtubeShortenedUrlResolvesMaxresThumbnail() {
        String result = fetcher.fetchThumbnailUrl("https://youtu.be/dQw4w9WgXcQ");
        assertEquals("https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", result);
    }

    @Test
    void youtubeUrlWithQueryParamsReturnsCorrectId() {
        // v= param not first
        String result = fetcher.fetchThumbnailUrl("https://www.youtube.com/watch?feature=share&v=abc123");
        assertEquals("https://img.youtube.com/vi/abc123/maxresdefault.jpg", result);
    }

    @Test
    void malformedUrlReturnsNull() {
        String result = fetcher.fetchThumbnailUrl("not-a-url-at-all");
        assertNull(result);
    }

    @Test
    void youtubeUrlWithoutVideoIdReturnsNull() {
        String result = fetcher.fetchThumbnailUrl("https://www.youtube.com/watch");
        assertNull(result);
    }

    @Test
    void nonYoutubeUrlAttemptsFetchViaYtDlp() {
        // yt-dlp is not installed in CI but the method must not throw — it returns null gracefully
        String result = fetcher.fetchThumbnailUrl("https://www.facebook.com/watch?v=123456");
        // Either null (yt-dlp not on PATH) or a URL string if it is — never throws
        assertTrue(result == null || result.startsWith("http"),
            "Expected null or a URL string, got: " + result);
    }
}
