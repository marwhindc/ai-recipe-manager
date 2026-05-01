package com.recipemanager.recipes.application;

import com.recipemanager.recipes.api.RecipeListResponse;
import com.recipemanager.recipes.api.RecipeRequest;
import com.recipemanager.recipes.api.RecipeResponse;
import java.util.UUID;

public interface RecipeService {

    RecipeListResponse listRecipes(UUID userId, int page, int pageSize);

    RecipeResponse getRecipe(UUID userId, UUID id);

    RecipeResponse createRecipe(UUID userId, RecipeRequest request);

    RecipeResponse updateRecipe(UUID userId, UUID id, RecipeRequest request);

    void deleteRecipe(UUID userId, UUID id);
}