package com.recipemanager.auth.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.recipemanager.auth.application.JwtService;
import com.recipemanager.auth.application.UserService;
import com.recipemanager.auth.domain.User;
import com.recipemanager.auth.infrastructure.UserRepository;
import jakarta.servlet.http.Cookie;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(value = AuthController.class,
        excludeAutoConfiguration = OAuth2ClientAutoConfiguration.class)
@Import(AuthControllerTest.TestSecurityConfig.class)
@TestPropertySource(properties = {
    "app.jwt.secret=dGVzdEp3dFNlY3JldEtleUZvclVuaXRUZXN0aW5nUHVycG9zZXM=",
    "app.cookie.secure=false"
})
class AuthControllerTest {

    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/auth/refresh", "/auth/logout").permitAll()
                    .requestMatchers("/auth/me").authenticated()
                    .anyRequest().permitAll())
                .exceptionHandling(ex -> ex
                    .defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        new OrRequestMatcher(
                            new AntPathRequestMatcher("/auth/me"))));
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void refreshWithValidTokenRotatesTokensAndReturns200() throws Exception {
        UUID userId = UUID.randomUUID();
        String oldRefresh = "old-refresh-token";
        String newAccess = "new-access-token";
        String newRefresh = "new-refresh-token";

        when(jwtService.validateRefreshToken(oldRefresh)).thenReturn(true);
        when(jwtService.extractUserId(oldRefresh)).thenReturn(userId);
        when(userService.verifyRefreshToken(userId, oldRefresh)).thenReturn(true);
        when(jwtService.generateAccessToken(userId)).thenReturn(newAccess);
        when(jwtService.generateRefreshToken(userId)).thenReturn(newRefresh);

        mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refresh_token", oldRefresh)))
                .andExpect(status().isOk())
                .andExpect(cookie().value("access_token", newAccess))
                .andExpect(cookie().value("refresh_token", newRefresh));

        verify(userService).storeRefreshTokenHash(eq(userId), eq(newRefresh));
    }

    @Test
    void refreshWithInvalidTokenReturns401() throws Exception {
        when(jwtService.validateRefreshToken(any())).thenReturn(false);

        mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refresh_token", "bad-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithReplayedTokenReturns401() throws Exception {
        UUID userId = UUID.randomUUID();
        String replayedToken = "replayed-token";

        when(jwtService.validateRefreshToken(replayedToken)).thenReturn(true);
        when(jwtService.extractUserId(replayedToken)).thenReturn(userId);
        when(userService.verifyRefreshToken(userId, replayedToken)).thenReturn(false);

        mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refresh_token", replayedToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithNoTokenReturns401() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    void logoutClearsTokenCookies() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("access_token", 0))
                .andExpect(cookie().maxAge("refresh_token", 0));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    void getMeReturnsUserIdentityForAuthenticatedUser() throws Exception {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        User user = new User("sub", "user@example.com", "Test User", "https://avatar.url");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.avatarUrl").value("https://avatar.url"));
    }

    @Test
    void getMeReturns401ForUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
