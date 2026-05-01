package com.recipemanager.videoimport.infrastructure;

import com.recipemanager.common.exception.VideoDownloadException;
import com.recipemanager.videoimport.application.VideoDownloader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Downloads audio from a source URL using the yt-dlp subprocess.
 * Requires yt-dlp to be installed and accessible at the configured path.
 */
@Component
public class YtDlpVideoDownloader implements VideoDownloader {

    private static final Logger log = LoggerFactory.getLogger(YtDlpVideoDownloader.class);

    private final String ytdlpPath;

    public YtDlpVideoDownloader(
            @Value("${app.videoimport.ytdlp-path:yt-dlp}") String ytdlpPath) {
        this.ytdlpPath = ytdlpPath;
    }

    @Override
    public Path download(String sourceUrl) {
        try {
            Path tempDir = Files.createTempDirectory("recipe-import-");
            Path outputFile = tempDir.resolve("audio.mp3");

            log.info("Downloading audio with yt-dlp: url={}", sourceUrl);

            ProcessBuilder pb = new ProcessBuilder(List.of(
                ytdlpPath,
                "-x",
                "--audio-format", "mp3",
                "--audio-quality", "5",
                "-o", outputFile.toString(),
                "--no-playlist",
                sourceUrl
            ));
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();

            log.debug("yt-dlp output: {}", output.trim());

            if (exitCode != 0) {
                log.error("yt-dlp exited with code {}: {}", exitCode, output.trim());
                throw new VideoDownloadException(
                    "yt-dlp exited with code " + exitCode + ": " + output.trim());
            }

            if (!Files.exists(outputFile)) {
                log.error("yt-dlp completed but no audio file was produced at {}", outputFile);
                throw new VideoDownloadException(
                    "yt-dlp completed but no audio file was produced at " + outputFile);
            }

            log.info("Audio download complete: path={} size={}B", outputFile, Files.size(outputFile));
            return outputFile;

        } catch (VideoDownloadException e) {
            throw e;
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Failed to start yt-dlp: {}", e.getMessage());
            throw new VideoDownloadException("Failed to start yt-dlp: " + e.getMessage());
        }
    }
}
