package com.recipemanager.videoimport.api;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.recipemanager.auth.api.OAuth2FailureHandler;
import com.recipemanager.auth.api.OAuth2SuccessHandler;
import com.recipemanager.auth.application.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipemanager.common.exception.RecipeExtractionException;
import com.recipemanager.common.exception.TranscriptionException;
import com.recipemanager.common.exception.VideoDownloadException;
import com.recipemanager.recipes.domain.Ingredient;
import com.recipemanager.recipes.domain.Step;
import com.recipemanager.videoimport.application.VideoImportOrchestrator;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(VideoImportController.class)
@WithMockUser
@TestPropertySource(properties = {
    "app.jwt.secret=dGVzdEp3dFNlY3JldEtleUZvclVuaXRUZXN0aW5nUHVycG9zZXM=",
    "app.cookie.secure=false",
    "spring.security.oauth2.client.registration.google.client-id=test-id",
    "spring.security.oauth2.client.registration.google.client-secret=test-secret"
})
class VideoImportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VideoImportOrchestrator orchestrator;

    @MockitoBean
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @MockitoBean
    private OAuth2FailureHandler oAuth2FailureHandler;

    @MockitoBean
    private JwtService jwtService;

    private static final String URL = "/api/v1/recipes/import/video";
    private static final String SOURCE_URL = "https://www.youtube.com/watch?v=test123";

    @Test
    void importVideoReturns200WithDraftPayload() throws Exception {
        RecipeDraftResponse draft = buildDraft();
        when(orchestrator.importFromLink(SOURCE_URL)).thenReturn(draft);

        mockMvc.perform(post(URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new VideoImportRequest(SOURCE_URL))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Carbonara"))
            .andExpect(jsonPath("$.sourceUrl").value(SOURCE_URL))
            .andExpect(jsonPath("$.source").value("youtube"))
            .andExpect(jsonPath("$.imageUrl").value("https://img.youtube.com/vi/test123/maxresdefault.jpg"))
            .andExpect(jsonPath("$.ingredients").isArray())
            .andExpect(jsonPath("$.steps").isArray());
    }

    @Test
    void importVideoReturns422OnDownloadFailure() throws Exception {
        when(orchestrator.importFromLink(SOURCE_URL))
            .thenThrow(new VideoDownloadException("yt-dlp failed"));

        mockMvc.perform(post(URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new VideoImportRequest(SOURCE_URL))))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.error").value("video_download_failed"));
    }

    @Test
    void importVideoReturns422OnTranscriptionFailure() throws Exception {
        when(orchestrator.importFromLink(SOURCE_URL))
            .thenThrow(new TranscriptionException("AssemblyAI failed"));

        mockMvc.perform(post(URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new VideoImportRequest(SOURCE_URL))))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.error").value("transcription_failed"));
    }

    @Test
    void importVideoReturns422OnExtractionFailure() throws Exception {
        when(orchestrator.importFromLink(SOURCE_URL))
            .thenThrow(new RecipeExtractionException("Gemini failed"));

        mockMvc.perform(post(URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new VideoImportRequest(SOURCE_URL))))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.error").value("recipe_extraction_failed"));
    }

    @Test
    void importVideoReturns400WhenSourceUrlBlank() throws Exception {
        mockMvc.perform(post(URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sourceUrl\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("validation_error"));
    }

    @Test
    void importVideoReturns400WhenBodyMissing() throws Exception {
        mockMvc.perform(post(URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }

    private RecipeDraftResponse buildDraft() {
        return new RecipeDraftResponse(
            "Carbonara",
            "Classic Roman pasta",
            List.of(new Ingredient("Pasta", "200", "g")),
            List.of(new Step(1, "Boil pasta")),
            "Italian",
            2,
            10,
            20,
            "https://img.youtube.com/vi/test123/maxresdefault.jpg",
            SOURCE_URL,
            "youtube");
    }
}
