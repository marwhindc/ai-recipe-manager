package com.recipemanager.auth.api;

import com.recipemanager.auth.application.JwtService;
import com.recipemanager.auth.application.UserService;
import com.recipemanager.auth.domain.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final boolean cookieSecure;
    private final String frontendOrigin;

    public OAuth2SuccessHandler(
            UserService userService,
            JwtService jwtService,
            @Value("${app.cookie.secure:true}") boolean cookieSecure,
            @Value("${app.frontend-origin:http://localhost:5173}") String frontendOrigin) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.cookieSecure = cookieSecure;
        this.frontendOrigin = frontendOrigin;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        String googleSub = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String displayName = oidcUser.getFullName();
        String avatarUrl = oidcUser.getPicture();

        User user = userService.upsertFromGoogle(googleSub, email, displayName, avatarUrl);
        UUID userId = user.getId();

        String accessToken = jwtService.generateAccessToken(userId);
        String refreshToken = jwtService.generateRefreshToken(userId);

        userService.storeRefreshTokenHash(userId, refreshToken);

        addCookie(response, "access_token", accessToken, 15 * 60);
        addCookie(response, "refresh_token", refreshToken, 30 * 24 * 60 * 60);

        response.sendRedirect(frontendOrigin + "/");
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
}
