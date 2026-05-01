package com.recipemanager.auth.api;

import com.recipemanager.auth.application.JwtService;
import com.recipemanager.auth.application.UserService;
import com.recipemanager.auth.infrastructure.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final boolean cookieSecure;

    public AuthController(
            JwtService jwtService,
            UserService userService,
            UserRepository userRepository,
            @Value("${app.cookie.secure:true}") boolean cookieSecure) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractCookie(request, "refresh_token").orElse(null);
        if (refreshToken == null || !jwtService.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        UUID userId;
        try {
            userId = jwtService.extractUserId(refreshToken);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }

        if (!userService.verifyRefreshToken(userId, refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        String newAccessToken = jwtService.generateAccessToken(userId);
        String newRefreshToken = jwtService.generateRefreshToken(userId);
        userService.storeRefreshTokenHash(userId, newRefreshToken);

        addCookie(response, "access_token", newAccessToken, 15 * 60);
        addCookie(response, "refresh_token", newRefreshToken, 30 * 24 * 60 * 60);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication, HttpServletResponse response) {
        if (authentication != null && authentication.isAuthenticated()) {
            try {
                userService.clearRefreshTokenHash(UUID.fromString(authentication.getName()));
            } catch (IllegalArgumentException ignored) {
            }
        }
        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserIdentityResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();
        return userRepository.findById(UUID.fromString(userId))
                .map(user -> ResponseEntity.ok(new UserIdentityResponse(
                        user.getId(), user.getDisplayName(), user.getAvatarUrl())))
                .orElse(ResponseEntity.status(401).build());
    }

    private Optional<String> extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        cookie.setSecure(cookieSecure);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setSecure(cookieSecure);
        response.addCookie(cookie);
    }

    public record UserIdentityResponse(UUID userId, String displayName, String avatarUrl) {}
}
