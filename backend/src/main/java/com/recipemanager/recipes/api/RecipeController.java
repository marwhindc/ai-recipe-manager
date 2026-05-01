package com.recipemanager.recipes.api;

import com.recipemanager.common.auth.AuthUserIdResolver;
import com.recipemanager.common.exception.UnauthorizedException;
import com.recipemanager.recipes.application.RecipeService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final AuthUserIdResolver authUserIdResolver;

    public RecipeController(RecipeService recipeService, AuthUserIdResolver authUserIdResolver) {
        this.recipeService = recipeService;
        this.authUserIdResolver = authUserIdResolver;
    }

    @GetMapping
    public RecipeListResponse listRecipes(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int pageSize,
        Principal principal
    ) {
        return recipeService.listRecipes(resolveUserId(principal), page, pageSize);
    }

    @GetMapping("/{id}")
    public RecipeResponse getRecipe(@PathVariable UUID id, Principal principal) {
        return recipeService.getRecipe(resolveUserId(principal), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeResponse createRecipe(@Valid @RequestBody RecipeRequest request, Principal principal) {
        return recipeService.createRecipe(resolveUserId(principal), request);
    }

    @PutMapping("/{id}")
    public RecipeResponse updateRecipe(
        @PathVariable UUID id,
        @Valid @RequestBody RecipeRequest request,
        Principal principal
    ) {
        return recipeService.updateRecipe(resolveUserId(principal), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRecipe(@PathVariable UUID id, Principal principal) {
        recipeService.deleteRecipe(resolveUserId(principal), id);
    }

    private UUID resolveUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new UnauthorizedException("Missing authenticated principal");
        }
        return authUserIdResolver.resolveUserId(principal.getName());
    }
}