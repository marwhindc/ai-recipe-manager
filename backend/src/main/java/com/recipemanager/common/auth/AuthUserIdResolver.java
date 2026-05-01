package com.recipemanager.common.auth;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AuthUserIdResolver {

    public UUID resolveUserId(String principalName) {
        return UUID.fromString(principalName);
    }
}