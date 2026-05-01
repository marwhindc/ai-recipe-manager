package com.recipemanager.common.auth;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AuthUserIdResolver {

    public UUID resolveUserId(String principalName) {
        return UUID.nameUUIDFromBytes(principalName.getBytes(StandardCharsets.UTF_8));
    }
}