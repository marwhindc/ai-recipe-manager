package com.recipemanager.videoimport.application;

import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import java.util.List;

/**
 * Internal domain record representing an AI-extracted recipe draft before it is
 * persisted or returned to the client.
 */
public record RecipeDraft(
    String title,
    String description,
    List<Ingredient> ingredients,
    List<Step> steps,
    String cuisine,
    Integer servings,
    Integer prepTimeMinutes,
    Integer cookTimeMinutes
) {}
