package com.recipemanager.videoimport.application;

import com.recipemanager.common.exception.VideoDownloadException;
import java.nio.file.Path;

/**
 * Port for downloading source video/audio to a local temp file.
 * Implementations must throw {@link VideoDownloadException} on failure.
 */
public interface VideoDownloader {

    /**
     * Downloads the audio track for the given source URL to a temporary local file.
     *
     * @param sourceUrl the URL of the video or audio source
     * @return path to the downloaded audio file; callers are responsible for deletion
     * @throws VideoDownloadException if download fails for any reason
     */
    Path download(String sourceUrl);
}
