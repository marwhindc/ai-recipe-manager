package com.recipemanager.recipes.infrastructure;

import com.recipemanager.recipes.domain.Recipe;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    Page<Recipe> findAllByUserId(UUID userId, Pageable pageable);

    Optional<Recipe> findByIdAndUserId(UUID id, UUID userId);

    long deleteByIdAndUserId(UUID id, UUID userId);
}