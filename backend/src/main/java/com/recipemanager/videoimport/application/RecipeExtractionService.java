package com.recipemanager.videoimport.application;

import com.recipemanager.common.exception.RecipeExtractionException;

/**
 * Port for extracting a structured recipe from transcribed content.
 * Implementations must throw {@link RecipeExtractionException} on failure.
 */
public interface RecipeExtractionService {

    /**
     * Extracts a structured recipe draft from the provided transcript text.
     *
     * @param transcript the raw transcribed text from the audio source
     * @return a structured {@link RecipeDraft} with recipe fields extracted by AI
     * @throws RecipeExtractionException if extraction fails for any reason
     */
    RecipeDraft extract(String transcript);
}
