package com.recipemanager.videoimport.infrastructure;

import com.recipemanager.videoimport.application.ThumbnailFetcher;
import java.net.URI;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Resolves thumbnail URLs using two strategies:
 * <ul>
 *   <li>YouTube — derives the standard max-resolution thumbnail URL directly from the video ID
 *       without making any external request.</li>
 *   <li>Facebook / other — delegates to yt-dlp {@code --print thumbnail} which prints the
 *       thumbnail URL without downloading the media file.</li>
 * </ul>
 * Failures are silenced and logged as warnings; the caller receives {@code null}.
 */
@Component
public class YtDlpThumbnailFetcher implements ThumbnailFetcher {

    private static final Logger log = LoggerFactory.getLogger(YtDlpThumbnailFetcher.class);

    private final String ytdlpPath;

    public YtDlpThumbnailFetcher(
            @Value("${app.videoimport.ytdlp-path:yt-dlp}") String ytdlpPath) {
        this.ytdlpPath = ytdlpPath;
    }

    @Override
    public String fetchThumbnailUrl(String sourceUrl) {
        try {
            String youtubeId = extractYoutubeId(sourceUrl);
            if (youtubeId != null) {
                String url = "https://img.youtube.com/vi/" + youtubeId + "/maxresdefault.jpg";
                log.debug("Resolved YouTube thumbnail: id={} url={}", youtubeId, url);
                return url;
            }

            return fetchViaYtDlp(sourceUrl);

        } catch (Exception e) {
            log.warn("Thumbnail resolution failed for {}: {}", sourceUrl, e.getMessage());
            return null;
        }
    }

    private String fetchViaYtDlp(String sourceUrl) {
        try {
            log.debug("Fetching thumbnail URL via yt-dlp for {}", sourceUrl);
            ProcessBuilder pb = new ProcessBuilder(List.of(
                ytdlpPath,
                "--print", "thumbnail",
                "--no-playlist",
                "--no-warnings",
                sourceUrl
            ));
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes()).trim();
            int exitCode = process.waitFor();

            if (exitCode != 0 || output.isBlank() || output.startsWith("ERROR")) {
                log.warn("yt-dlp --print thumbnail failed (exit={}) for {}", exitCode, sourceUrl);
                return null;
            }

            // yt-dlp may print multiple lines; take the first non-blank one
            String thumbnailUrl = output.lines()
                .map(String::trim)
                .filter(l -> l.startsWith("http"))
                .findFirst()
                .orElse(null);

            log.debug("yt-dlp resolved thumbnail: {}", thumbnailUrl);
            return thumbnailUrl;

        } catch (Exception e) {
            log.warn("yt-dlp thumbnail fetch threw for {}: {}", sourceUrl, e.getMessage());
            return null;
        }
    }

    /**
     * Extracts the video ID from a YouTube URL, or returns {@code null} for non-YouTube URLs.
     * Handles both {@code youtube.com/watch?v=ID} and {@code youtu.be/ID} formats.
     */
    private String extractYoutubeId(String sourceUrl) {
        try {
            URI uri = URI.create(sourceUrl);
            String host = uri.getHost();
            if (host == null) return null;

            if (host.contains("youtu.be")) {
                String path = uri.getPath();
                return (path != null && path.length() > 1) ? path.substring(1) : null;
            }

            if (host.contains("youtube.com")) {
                String query = uri.getQuery();
                if (query == null) return null;
                for (String param : query.split("&")) {
                    if (param.startsWith("v=")) {
                        String id = param.substring(2);
                        return id.isBlank() ? null : id;
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not parse URL for YouTube ID extraction: {}", sourceUrl);
        }
        return null;
    }
}
