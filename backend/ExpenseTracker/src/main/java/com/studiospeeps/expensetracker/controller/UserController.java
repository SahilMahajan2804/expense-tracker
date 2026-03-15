package com.studiospeeps.expensetracker.controller;

import com.studiospeeps.expensetracker.dto.UserProfileResponse;
import com.studiospeeps.expensetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "${ALLOWED_ORIGINS}")
public class UserController {

    private final UserService userService;

    // ==================== GET MY PROFILE ====================
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            UserProfileResponse profile = userService.getUserByEmail(email);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(Authentication authentication, @RequestBody com.studiospeeps.expensetracker.dto.RegisterRequest request) {
        try {
            String email = authentication.getName();
            UserProfileResponse existingProfile = userService.getUserByEmail(email);
            UserProfileResponse updated = userService.updateUserById(existingProfile.getId(), request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET ALL USERS (Admin) ====================
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserProfileResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET USER BY ID ====================
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserProfileResponse user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== DELETE USER (Admin) ====================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userService.deleteUserById(id);
    }
}