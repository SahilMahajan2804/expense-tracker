package com.studiospeeps.expensetracker.service;

import com.studiospeeps.expensetracker.dto.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UserService {
    RegisterResponse register(RegisterRequest request);
    ResponseEntity<?> verifyUser(String email, String otp);
    LoginResponse login(LoginRequest request, HttpServletResponse response);

    List<UserProfileResponse> getAllUsers();

    UserProfileResponse getUserById(Long id);

    UserProfileResponse updateUserById(Long id, RegisterRequest request);

    ResponseEntity<String> deleteUserById(Long id);

    UserProfileResponse getUserByEmail(String email);
    ResponseEntity<?> forgotPassword(String email);
    ResponseEntity<?> resetPassword(ResetPasswordRequest request);
}
