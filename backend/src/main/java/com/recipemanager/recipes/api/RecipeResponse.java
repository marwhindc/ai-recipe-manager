package com.recipemanager.recipes.api;

import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecipeResponse(
    UUID id,
    String title,
    String description,
    List<Ingredient> ingredients,
    List<Step> steps,
    String cuisine,
    Integer servings,
    Integer prepTimeMinutes,
    Integer cookTimeMinutes,
    Integer totalTimeMinutes,
    String imageUrl,
    String sourceUrl,
    String source,
    Instant createdAt,
    Instant updatedAt
) {
}