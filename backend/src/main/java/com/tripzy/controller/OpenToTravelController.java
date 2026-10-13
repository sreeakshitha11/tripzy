package com.tripzy.controller;

import com.tripzy.entity.User;
import com.tripzy.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/open-to-travel")
public class OpenToTravelController {

    private final UserRepository userRepository;

    public OpenToTravelController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/travelers")
    public ResponseEntity<List<User>> getOpenTravelers() {
        return ResponseEntity.ok(userRepository.findByOpenToTravelTrue());
    }
}
