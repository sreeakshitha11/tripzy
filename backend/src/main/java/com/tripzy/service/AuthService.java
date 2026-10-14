package com.tripzy.service;

import com.tripzy.dto.AuthDtos.*;
import com.tripzy.entity.User;
import com.tripzy.entity.UserPreference;
import com.tripzy.exception.BadRequestException;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.UserPreferenceRepository;
import com.tripzy.repository.UserRepository;
import com.tripzy.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       UserPreferenceRepository preferenceRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    // Emails are matched trimmed and lower-cased, so "Name@Gmail.com " from a phone keyboard finds the account
    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getTravelStyle(),
                user.getTrustScore(),
                user.getOpenToTravel()
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName() != null ? request.getFullName().trim() : null);
        user.setTravelStyle(request.getTravelStyle() != null ? request.getTravelStyle() : "Explorer");
        user.setHomeCity(request.getHomeCity());
        user.setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80");
        user.setRole("ROLE_USER");
        user.setTrustScore(92);
        user.setIsVerified(true);
        user.setOpenToTravel(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // default preferences
        UserPreference pref = new UserPreference(
                savedUser.getId(),
                "Adventure, Culture, Nature",
                "Mountains, Coastal Escapes",
                "Moderate",
                "1-2 Weeks",
                savedUser.getTravelStyle()
        );
        preferenceRepository.save(pref);

        String token = tokenProvider.generateTokenForUser(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getAvatarUrl(),
                savedUser.getRole(),
                savedUser.getTravelStyle(),
                savedUser.getTrustScore(),
                savedUser.getOpenToTravel()
        );
    }

    public User getMe(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = getMe(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getTravelStyle() != null) user.setTravelStyle(request.getTravelStyle());
        if (request.getBudgetPreference() != null) user.setBudgetPreference(request.getBudgetPreference());
        if (request.getOpenToTravel() != null) user.setOpenToTravel(request.getOpenToTravel());
        if (request.getHomeCity() != null) user.setHomeCity(request.getHomeCity());
        if (request.getPreferredActivities() != null) user.setPreferredActivities(request.getPreferredActivities());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public UserPreference updatePreferences(Long userId, UserPreferenceRequest request) {
        UserPreference pref = preferenceRepository.findByUserId(userId)
                .orElse(new UserPreference());
        pref.setUserId(userId);
        if (request.getPreferredInterests() != null) pref.setPreferredInterests(request.getPreferredInterests());
        if (request.getPreferredDestinations() != null) pref.setPreferredDestinations(request.getPreferredDestinations());
        if (request.getPreferredBudget() != null) pref.setPreferredBudget(request.getPreferredBudget());
        if (request.getPreferredDuration() != null) pref.setPreferredDuration(request.getPreferredDuration());
        if (request.getPreferredTravelStyle() != null) pref.setPreferredTravelStyle(request.getPreferredTravelStyle());
        return preferenceRepository.save(pref);
    }

    public UserPreference getPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> new UserPreference(userId, "Adventure, Culture", "All", "Moderate", "1-2 Weeks", "Explorer"));
    }

    public boolean forgotPassword(String email) {
        return userRepository.existsByEmail(email);
    }
}
