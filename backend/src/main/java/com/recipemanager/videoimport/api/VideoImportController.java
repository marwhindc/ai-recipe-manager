package com.recipemanager.videoimport.api;

import com.recipemanager.videoimport.application.VideoImportOrchestrator;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recipes/import")
public class VideoImportController {

    private final VideoImportOrchestrator orchestrator;

    public VideoImportController(VideoImportOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/video")
    public ResponseEntity<RecipeDraftResponse> importFromVideo(@Valid @RequestBody VideoImportRequest request) {
        RecipeDraftResponse draft = orchestrator.importFromLink(request.sourceUrl());
        return ResponseEntity.ok(draft);
    }
}
