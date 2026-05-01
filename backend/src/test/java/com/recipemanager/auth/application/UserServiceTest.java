package com.recipemanager.auth.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recipemanager.auth.domain.User;
import com.recipemanager.auth.infrastructure.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    @BeforeEach
    void setup() {
        userService = new UserService(userRepository);
    }

    @Test
    void upsertFromGoogleCreatesNewUserWhenNotFound() {
        when(userRepository.findByGoogleSub("sub123")).thenReturn(Optional.empty());
        User newUser = new User("sub123", "user@example.com", "Test User", "https://avatar.url");
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        User result = userService.upsertFromGoogle("sub123", "user@example.com", "Test User", "https://avatar.url");

        assertNotNull(result);
        assertEquals("sub123", result.getGoogleSub());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void upsertFromGoogleUpdatesExistingUser() {
        User existing = new User("sub123", "old@example.com", "Old Name", "https://old.url");
        when(userRepository.findByGoogleSub("sub123")).thenReturn(Optional.of(existing));
        when(userRepository.save(existing)).thenReturn(existing);

        User result = userService.upsertFromGoogle("sub123", "new@example.com", "New Name", "https://new.url");

        assertNotNull(result);
        assertEquals("New Name", result.getDisplayName());
        assertEquals("new@example.com", result.getEmail());
        verify(userRepository).save(existing);
    }

    @Test
    void storeRefreshTokenHashSavesHashedToken() {
        UUID userId = UUID.randomUUID();
        User user = new User("sub", "u@e.com", "Name", null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        userService.storeRefreshTokenHash(userId, "raw-token");

        assertNotNull(user.getRefreshTokenHash());
        verify(userRepository).save(user);
    }

    @Test
    void clearRefreshTokenHashNullsTheHash() {
        UUID userId = UUID.randomUUID();
        User user = new User("sub", "u@e.com", "Name", null);
        user.setRefreshTokenHash("some-hash");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        userService.clearRefreshTokenHash(userId);

        verify(userRepository).save(user);
    }

    @Test
    void verifyRefreshTokenReturnsTrueForMatchingToken() {
        UUID userId = UUID.randomUUID();
        User user = new User("sub", "u@e.com", "Name", null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        userService.storeRefreshTokenHash(userId, "my-refresh-token");

        assertTrue(userService.verifyRefreshToken(userId, "my-refresh-token"));
    }

    @Test
    void verifyRefreshTokenReturnsFalseForWrongToken() {
        UUID userId = UUID.randomUUID();
        User user = new User("sub", "u@e.com", "Name", null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        userService.storeRefreshTokenHash(userId, "correct-token");

        assertFalse(userService.verifyRefreshToken(userId, "wrong-token"));
    }
}
