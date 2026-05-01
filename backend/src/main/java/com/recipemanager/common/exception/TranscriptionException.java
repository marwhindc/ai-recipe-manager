package com.recipemanager.common.exception;

import org.springframework.http.HttpStatus;

public class TranscriptionException extends AppException {

    public TranscriptionException(String message) {
        super("transcription_failed", message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
