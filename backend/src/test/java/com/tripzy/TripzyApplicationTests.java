package com.tripzy;

import com.tripzy.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TripzyApplicationTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void contextLoads() {
        assertNotNull(passwordEncoder);
        assertNotNull(jwtTokenProvider);
    }

    @Test
    void testPasswordEncoding() {
        String rawPassword = "SecurePassword@123";
        String encoded = passwordEncoder.encode(rawPassword);
        assertNotNull(encoded);
        assertTrue(passwordEncoder.matches(rawPassword, encoded));
        assertFalse(passwordEncoder.matches("WrongPassword", encoded));
    }

    @Test
    void testJwtTokenGenerationAndValidation() {
        String token = jwtTokenProvider.generateTokenForUser(100L, "test@tripzy.com", "Test User");
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(100L, jwtTokenProvider.getUserIdFromJWT(token));
    }
}
