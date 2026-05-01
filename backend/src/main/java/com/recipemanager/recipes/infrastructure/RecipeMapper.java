package com.recipemanager.recipes.infrastructure;

import com.recipemanager.recipes.api.RecipeRequest;
import com.recipemanager.recipes.api.RecipeResponse;
import com.recipemanager.recipes.domain.Recipe;
import java.util.ArrayList;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class RecipeMapper {

    public Recipe toNewEntity(UUID userId, RecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setUserId(userId);
        applyRequest(recipe, request);
        return recipe;
    }

    public void applyRequest(Recipe recipe, RecipeRequest request) {
        recipe.setTitle(request.title());
        recipe.setDescription(request.description());
        recipe.setIngredients(new ArrayList<>(request.ingredients()));
        recipe.setSteps(new ArrayList<>(request.steps()));
        recipe.setCuisine(request.cuisine());
        recipe.setServings(request.servings());
        recipe.setPrepTimeMinutes(request.prepTimeMinutes());
        recipe.setCookTimeMinutes(request.cookTimeMinutes());
        recipe.setImageUrl(request.imageUrl());
    }

    public RecipeResponse toResponse(Recipe recipe) {
        int totalTime = (recipe.getPrepTimeMinutes() == null ? 0 : recipe.getPrepTimeMinutes())
            + (recipe.getCookTimeMinutes() == null ? 0 : recipe.getCookTimeMinutes());

        return new RecipeResponse(
            recipe.getId(),
            recipe.getTitle(),
            recipe.getDescription(),
            recipe.getIngredients(),
            recipe.getSteps(),
            recipe.getCuisine(),
            recipe.getServings(),
            recipe.getPrepTimeMinutes(),
            recipe.getCookTimeMinutes(),
            totalTime,
            recipe.getImageUrl(),
            recipe.getCreatedAt(),
            recipe.getUpdatedAt());
    }
}