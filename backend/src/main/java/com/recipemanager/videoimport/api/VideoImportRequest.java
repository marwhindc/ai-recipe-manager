package com.recipemanager.videoimport.api;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for the recipe import endpoint.
 */
public record VideoImportRequest(
    @NotBlank(message = "sourceUrl is required") String sourceUrl
) {}
