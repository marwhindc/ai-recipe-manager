package com.recipemanager.recipes.api;

import java.util.List;

public record RecipeListResponse(List<RecipeResponse> data, long total, int page, int pageSize) {
}