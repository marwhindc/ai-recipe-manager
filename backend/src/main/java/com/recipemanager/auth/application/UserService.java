package com.recipemanager.auth.application;

import com.recipemanager.auth.domain.User;
import com.recipemanager.auth.infrastructure.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User upsertFromGoogle(String googleSub, String email, String displayName, String avatarUrl) {
        return userRepository.findByGoogleSub(googleSub)
                .map(existing -> {
                    existing.updateFromGoogle(email, displayName, avatarUrl);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(new User(googleSub, email, displayName, avatarUrl)));
    }

    @Transactional
    public void storeRefreshTokenHash(UUID userId, String rawToken) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setRefreshTokenHash(passwordEncoder.encode(sha256(rawToken)));
            userRepository.save(user);
        });
    }

    @Transactional
    public void clearRefreshTokenHash(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.clearRefreshTokenHash();
            userRepository.save(user);
        });
    }

    public boolean verifyRefreshToken(UUID userId, String rawToken) {
        return userRepository.findById(userId)
                .map(user -> user.getRefreshTokenHash() != null
                        && passwordEncoder.matches(sha256(rawToken), user.getRefreshTokenHash()))
                .orElse(false);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
