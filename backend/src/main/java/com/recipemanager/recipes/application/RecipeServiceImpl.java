package com.recipemanager.recipes.application;

import com.recipemanager.common.exception.ResourceNotFoundException;
import com.recipemanager.recipes.api.RecipeListResponse;
import com.recipemanager.recipes.api.RecipeRequest;
import com.recipemanager.recipes.api.RecipeResponse;
import com.recipemanager.recipes.domain.Recipe;
import com.recipemanager.recipes.infrastructure.RecipeMapper;
import com.recipemanager.recipes.infrastructure.RecipeRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;

    public RecipeServiceImpl(RecipeRepository recipeRepository, RecipeMapper recipeMapper) {
        this.recipeRepository = recipeRepository;
        this.recipeMapper = recipeMapper;
    }

    @Override
    public RecipeListResponse listRecipes(UUID userId, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.max(pageSize, 1);

        Page<Recipe> pageResult = recipeRepository.findAllByUserId(
            userId,
            PageRequest.of(safePage - 1, safePageSize, Sort.by(Sort.Direction.DESC, "createdAt")));

        return new RecipeListResponse(
            pageResult.getContent().stream().map(recipeMapper::toResponse).toList(),
            pageResult.getTotalElements(),
            safePage,
            safePageSize);
    }

    @Override
    public RecipeResponse getRecipe(UUID userId, UUID id) {
        Recipe recipe = recipeRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));
        return recipeMapper.toResponse(recipe);
    }

    @Override
    @Transactional
    public RecipeResponse createRecipe(UUID userId, RecipeRequest request) {
        Recipe saved = recipeRepository.save(recipeMapper.toNewEntity(userId, request));
        return recipeMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RecipeResponse updateRecipe(UUID userId, UUID id, RecipeRequest request) {
        Recipe recipe = recipeRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        recipeMapper.applyRequest(recipe, request);
        Recipe updated = recipeRepository.save(recipe);
        return recipeMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRecipe(UUID userId, UUID id) {
        long deleted = recipeRepository.deleteByIdAndUserId(id, userId);
        if (deleted == 0L) {
            throw new ResourceNotFoundException("Recipe not found");
        }
    }
}