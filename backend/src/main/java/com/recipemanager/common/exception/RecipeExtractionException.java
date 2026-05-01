package com.recipemanager.common.exception;

import org.springframework.http.HttpStatus;

public class RecipeExtractionException extends AppException {

    public RecipeExtractionException(String message) {
        super("recipe_extraction_failed", message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
