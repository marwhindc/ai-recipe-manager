package com.recipemanager.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends AppException {

    public ResourceNotFoundException(String message) {
        super("resource_not_found", message, HttpStatus.NOT_FOUND);
    }
}