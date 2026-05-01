package com.recipemanager.videoimport.api;

import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import java.util.List;

/**
 * API response returned by the import endpoint. The client uses this as initial
 * form data for review before persisting the recipe.
 */
public record RecipeDraftResponse(
    String title,
    String description,
    List<Ingredient> ingredients,
    List<Step> steps,
    String cuisine,
    Integer servings,
    Integer prepTimeMinutes,
    Integer cookTimeMinutes,
    String imageUrl,
    String sourceUrl,
    String source
) {}
