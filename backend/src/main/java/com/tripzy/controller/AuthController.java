package com.tripzy.controller;

import com.tripzy.dto.AuthDtos.*;
import com.tripzy.entity.User;
import com.tripzy.entity.UserPreference;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getMe(principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(principal.getId(), request));
    }

    @GetMapping("/preferences")
    public ResponseEntity<UserPreference> getPreferences(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getPreferences(principal.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreference> updatePreferences(@AuthenticationPrincipal UserPrincipal principal,
                                                           @RequestBody UserPreferenceRequest request) {
        return ResponseEntity.ok(authService.updatePreferences(principal.getId(), request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        boolean exists = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", exists ? "A password reset link has been dispatched to your email." :
                        "If that account exists, instructions have been sent."
        ));
    }
}
