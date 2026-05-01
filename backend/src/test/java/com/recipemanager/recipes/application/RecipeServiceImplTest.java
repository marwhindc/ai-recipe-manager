package com.recipemanager.recipes.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recipemanager.common.exception.ResourceNotFoundException;
import com.recipemanager.recipes.api.RecipeListResponse;
import com.recipemanager.recipes.api.RecipeRequest;
import com.recipemanager.recipes.api.RecipeResponse;
import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Recipe;
import com.recipemanager.recipes.domain.Step;
import com.recipemanager.recipes.infrastructure.RecipeMapper;
import com.recipemanager.recipes.infrastructure.RecipeRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class RecipeServiceImplTest {

    @Mock
    private RecipeRepository repository;

    private RecipeServiceImpl service;
    private RecipeMapper mapper;

    @BeforeEach
    void setup() {
        mapper = new RecipeMapper();
        service = new RecipeServiceImpl(repository, mapper);
    }

    @Test
    void listRecipesReturnsMappedPage() {
        UUID userId = UUID.randomUUID();
        Recipe recipe = buildRecipe(userId);
        when(repository.findAllByUserId(any(), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(recipe)));

        RecipeListResponse response = service.listRecipes(userId, 1, 20);

        assertEquals(1, response.data().size());
        assertEquals(1, response.total());
        assertEquals("Adobo", response.data().getFirst().title());
    }

    @Test
    void getRecipeThrowsWhenNotOwned() {
        UUID userId = UUID.randomUUID();
        UUID recipeId = UUID.randomUUID();
        when(repository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getRecipe(userId, recipeId));
    }

    @Test
    void createRecipePersistsAndReturnsResponse() {
        UUID userId = UUID.randomUUID();
        RecipeRequest request = buildRequest();
        Recipe saved = buildRecipe(userId);
        when(repository.save(any(Recipe.class))).thenReturn(saved);

        RecipeResponse response = service.createRecipe(userId, request);

        assertEquals(saved.getId(), response.id());
        assertEquals("Adobo", response.title());
    }

    @Test
    void updateRecipeThrowsWhenMissing() {
        UUID userId = UUID.randomUUID();
        UUID recipeId = UUID.randomUUID();
        when(repository.findByIdAndUserId(recipeId, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.updateRecipe(userId, recipeId, buildRequest()));
    }

    @Test
    void deleteRecipeThrowsWhenNoRowDeleted() {
        UUID userId = UUID.randomUUID();
        UUID recipeId = UUID.randomUUID();
        when(repository.deleteByIdAndUserId(recipeId, userId)).thenReturn(0L);

        assertThrows(ResourceNotFoundException.class, () -> service.deleteRecipe(userId, recipeId));
    }

    @Test
    void deleteRecipeCallsRepository() {
        UUID userId = UUID.randomUUID();
        UUID recipeId = UUID.randomUUID();
        when(repository.deleteByIdAndUserId(recipeId, userId)).thenReturn(1L);

        service.deleteRecipe(userId, recipeId);

        verify(repository).deleteByIdAndUserId(recipeId, userId);
    }

    @Test
    void createRecipeWithSourceFieldsPersistsProvenance() {
        UUID userId = UUID.randomUUID();
        RecipeRequest request = buildRequestWithSource();
        Recipe saved = buildRecipeWithSource(userId);
        when(repository.save(any(Recipe.class))).thenReturn(saved);

        RecipeResponse response = service.createRecipe(userId, request);

        assertEquals("https://youtube.com/watch?v=abc", response.sourceUrl());
        assertEquals("youtube", response.source());
    }

    private RecipeRequest buildRequest() {
        return new RecipeRequest(
            "Adobo",
            "Classic dish",
            List.of(new Ingredient("Chicken", "1", "kg")),
            List.of(new Step(1, "Simmer chicken")),
            "Filipino",
            4,
            15,
            45,
            "https://example.com/image.jpg",
            null,
            null);
    }

    private Recipe buildRecipe(UUID userId) {
        Recipe recipe = new Recipe();
        recipe.setId(UUID.randomUUID());
        recipe.setUserId(userId);
        recipe.setTitle("Adobo");
        recipe.setDescription("Classic dish");
        recipe.setIngredients(List.of(new Ingredient("Chicken", "1", "kg")));
        recipe.setSteps(List.of(new Step(1, "Simmer chicken")));
        recipe.setCuisine("Filipino");
        recipe.setServings(4);
        recipe.setPrepTimeMinutes(15);
        recipe.setCookTimeMinutes(45);
        recipe.setImageUrl("https://example.com/image.jpg");
        recipe.setId(UUID.randomUUID());

        try {
            var createdAtField = Recipe.class.getDeclaredField("createdAt");
            var updatedAtField = Recipe.class.getDeclaredField("updatedAt");
            createdAtField.setAccessible(true);
            updatedAtField.setAccessible(true);
            createdAtField.set(recipe, Instant.now());
            updatedAtField.set(recipe, Instant.now());
        } catch (ReflectiveOperationException ignored) {
        }

        return recipe;
    }

    private RecipeRequest buildRequestWithSource() {
        return new RecipeRequest(
            "Adobo",
            "Classic dish",
            List.of(new Ingredient("Chicken", "1", "kg")),
            List.of(new Step(1, "Simmer chicken")),
            "Filipino",
            4,
            15,
            45,
            "https://example.com/image.jpg",
            "https://youtube.com/watch?v=abc",
            "youtube");
    }

    private Recipe buildRecipeWithSource(UUID userId) {
        Recipe recipe = buildRecipe(userId);
        recipe.setSourceUrl("https://youtube.com/watch?v=abc");
        recipe.setSource("youtube");
        return recipe;
    }
}