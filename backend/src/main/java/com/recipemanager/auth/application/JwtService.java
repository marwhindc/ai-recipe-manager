package com.recipemanager.auth.application;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final String CLAIM_USER_ID = "userId";
    private static final String TOKEN_TYPE_CLAIM = "type";
    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";

    private final SecretKey signingKey;
    private final long accessTtlMillis;
    private final long refreshTtlMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String base64Secret,
            @Value("${app.jwt.access-ttl-minutes:15}") long accessTtlMinutes,
            @Value("${app.jwt.refresh-ttl-days:30}") long refreshTtlDays) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(base64Secret));
        this.accessTtlMillis = accessTtlMinutes * 60 * 1000L;
        this.refreshTtlMillis = refreshTtlDays * 24 * 60 * 60 * 1000L;
    }

    public String generateAccessToken(UUID userId) {
        return buildToken(userId, ACCESS_TOKEN_TYPE, accessTtlMillis);
    }

    public String generateRefreshToken(UUID userId) {
        return buildToken(userId, REFRESH_TOKEN_TYPE, refreshTtlMillis);
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).get(CLAIM_USER_ID, String.class));
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, ACCESS_TOKEN_TYPE);
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, REFRESH_TOKEN_TYPE);
    }

    private String buildToken(UUID userId, String type, long ttlMillis) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claim(CLAIM_USER_ID, userId.toString())
                .claim(TOKEN_TYPE_CLAIM, type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(ttlMillis)))
                .signWith(signingKey)
                .compact();
    }

    private boolean validateToken(String token, String expectedType) {
        try {
            Claims claims = parseClaims(token);
            return expectedType.equals(claims.get(TOKEN_TYPE_CLAIM, String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
