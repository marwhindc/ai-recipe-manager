package com.recipemanager.recipes.api;

import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RecipeRequest(
    @NotBlank(message = "title is required") String title,
    String description,
    @NotNull(message = "ingredients is required") List<Ingredient> ingredients,
    @NotNull(message = "steps is required") List<Step> steps,
    String cuisine,
    Integer servings,
    Integer prepTimeMinutes,
    Integer cookTimeMinutes,
    String imageUrl
) {
}