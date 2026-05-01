package com.recipemanager.videoimport.application;

/**
 * Port for resolving a thumbnail/cover image URL for a given source URL.
 * Implementations are best-effort: they must return {@code null} rather than
 * throwing when the thumbnail cannot be determined.
 */
public interface ThumbnailFetcher {

    /**
     * Attempts to resolve a publicly accessible thumbnail URL for the given source.
     *
     * @param sourceUrl the URL of the video or recipe page
     * @return a thumbnail URL, or {@code null} if one could not be determined
     */
    String fetchThumbnailUrl(String sourceUrl);
}
