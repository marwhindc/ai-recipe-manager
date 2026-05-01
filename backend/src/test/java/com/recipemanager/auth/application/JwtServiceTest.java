package com.recipemanager.auth.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.jsonwebtoken.JwtException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    // Base64 of "testJwtSecretKeyForUnitTestingPurposes" (39 bytes = 312 bits, > 256 bits required for HS256)
    private static final String TEST_SECRET = "dGVzdEp3dFNlY3JldEtleUZvclVuaXRUZXN0aW5nUHVycG9zZXM=";

    private JwtService jwtService;

    @BeforeEach
    void setup() {
        jwtService = new JwtService(TEST_SECRET, 15L, 30L);
    }

    @Test
    void generateAccessTokenContainsUserId() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateAccessToken(userId);
        assertNotNull(token);
        assertEquals(userId, jwtService.extractUserId(token));
    }

    @Test
    void generateRefreshTokenContainsUserId() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateRefreshToken(userId);
        assertNotNull(token);
        assertEquals(userId, jwtService.extractUserId(token));
    }

    @Test
    void validateAccessTokenReturnsTrueForValidToken() {
        String token = jwtService.generateAccessToken(UUID.randomUUID());
        assertTrue(jwtService.validateAccessToken(token));
    }

    @Test
    void validateAccessTokenReturnsFalseForRefreshToken() {
        String refreshToken = jwtService.generateRefreshToken(UUID.randomUUID());
        assertFalse(jwtService.validateAccessToken(refreshToken));
    }

    @Test
    void validateRefreshTokenReturnsTrueForValidToken() {
        String token = jwtService.generateRefreshToken(UUID.randomUUID());
        assertTrue(jwtService.validateRefreshToken(token));
    }

    @Test
    void validateRefreshTokenReturnsFalseForAccessToken() {
        String accessToken = jwtService.generateAccessToken(UUID.randomUUID());
        assertFalse(jwtService.validateRefreshToken(accessToken));
    }

    @Test
    void validateAccessTokenReturnsFalseForGarbage() {
        assertFalse(jwtService.validateAccessToken("not.a.token"));
    }

    @Test
    void extractUserIdThrowsForInvalidToken() {
        assertThrows(Exception.class, () -> jwtService.extractUserId("invalid.token.here"));
    }
}
