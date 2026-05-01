package com.recipemanager.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "google_sub", nullable = false, unique = true)
    private String googleSub;

    @Column(nullable = false)
    private String email;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "refresh_token_hash")
    private String refreshTokenHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected User() {}

    public User(String googleSub, String email, String displayName, String avatarUrl) {
        this.googleSub = googleSub;
        this.email = email;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
    }

    public UUID getId() { return id; }
    public String getGoogleSub() { return googleSub; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getRefreshTokenHash() { return refreshTokenHash; }

    public void updateFromGoogle(String email, String displayName, String avatarUrl) {
        this.email = email;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
    }

    public void setRefreshTokenHash(String hash) { this.refreshTokenHash = hash; }
    public void clearRefreshTokenHash() { this.refreshTokenHash = null; }
}
