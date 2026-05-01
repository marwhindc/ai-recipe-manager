package com.recipemanager.common.exception;

import org.springframework.http.HttpStatus;

public class VideoDownloadException extends AppException {

    public VideoDownloadException(String message) {
        super("video_download_failed", message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
