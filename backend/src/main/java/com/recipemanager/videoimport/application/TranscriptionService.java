package com.recipemanager.videoimport.application;

import com.recipemanager.common.exception.TranscriptionException;
import java.nio.file.Path;

/**
 * Port for transcribing audio files to plain text.
 * Implementations must throw {@link TranscriptionException} on failure.
 */
public interface TranscriptionService {

    /**
     * Transcribes the given audio file to text.
     *
     * @param audioFile path to the local audio file to transcribe
     * @return the full transcript as a plain text string
     * @throws TranscriptionException if transcription fails for any reason
     */
    String transcribe(Path audioFile);
}
