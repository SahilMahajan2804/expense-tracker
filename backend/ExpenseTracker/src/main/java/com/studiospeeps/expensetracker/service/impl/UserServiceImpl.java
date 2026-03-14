package com.studiospeeps.expensetracker.service.impl;

import com.studiospeeps.expensetracker.dto.*;
import com.studiospeeps.expensetracker.entity.Users;
import com.studiospeeps.expensetracker.repo.UserRepository;
import com.studiospeeps.expensetracker.service.JwtService;
import com.studiospeeps.expensetracker.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    @Autowired
    private final UserRepository userRepo;
    @Autowired
    private final ModelMapper modelMapper;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        Users user = modelMapper.map(request, Users.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String otp = generateOtp();
        user.setOtp(otp);
        user = userRepo.save(user);
        sendVerificationMail(user.getEmail(), user.getOtp());;
        return RegisterResponse.builder()
                .email(user.getEmail())
                .registerMessage("Successfully registered the account. Please verify with OTP.")
                .build();
    }

    @Override
    public ResponseEntity<?> verifyUser(String email, String otp) {
        Users user = userRepo.findByEmail(email);
        if(user == null){
            throw new RuntimeException("User not found");
        } else if (user.isVerified()){
            throw new RuntimeException("User is already verified");
        } else if(otp.equals(user.getOtp())){
            user.setVerified(true);
            user = userRepo.save(user);
            return ResponseEntity.ok(OtpResponse.builder()
                    .email(email)
                    .message("Email verified successfully. You can now login.")
                    .verified(true)
                    .build());
        } else {
            throw new RuntimeException("Invalid OTP. Please check your email and try again.");
        }
    }

    public String generateOtp(){
        Random random = new Random();
        int otp = 100000+ random.nextInt(899999);
        return String.valueOf(otp);
    }

    public void sendVerificationMail(String email, String otp) {
        String subject = "Email verification";
        String body = "Your cerification otp is :" + otp;
        emailService.sendMail(email, subject, body);
    }

    @Override
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        if(authentication != null){
            // Fetch user from database to get all details
            Users user = userRepo.findByEmail(request.getEmail());
            if(user == null) {
                throw new UsernameNotFoundException("User not found");
            }

            String token = jwtService.generateToken(request.getEmail());

            Cookie cookie = new Cookie("JWT_TOKEN", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60);
            response.addCookie(cookie);

            // Build complete login response with ALL user details
            LoginResponse loginResponse = LoginResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .firstname(user.getFirstname())
                    .lastname(user.getLastname())
                    .role(user.getRole())           // ← Add this
                    .department(user.getDepartment()) // ← Add this if exists
                    .jwtToken(token)
                    .tokenType("Bearer")
                    .expiresIn(24 * 60 * 60 * 6600 *1000L) // 24 hours in milliseconds
                    .message("Login successful")
                    .build();

            return loginResponse;
        }
        throw new IllegalArgumentException("Credentials are wrong");
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        List<Users> usersList = userRepo.findAll();
        List<UserProfileResponse> userProfileResponseList = usersList
                .stream()
                .map(mapper -> modelMapper.map(mapper, UserProfileResponse.class))
                .toList();
        return userProfileResponseList;
    }

    @Override
    public UserProfileResponse getUserById(Long id) {
        Users user = userRepo.findById(id).orElseThrow();
        UserProfileResponse userProfileResponse = modelMapper.map(user, UserProfileResponse.class);
        return userProfileResponse;
    }

    @Override
    public UserProfileResponse updateUserById(Long id, RegisterRequest request) {
        Users user = userRepo.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found "));
        modelMapper.map(request, user);
        user.setId(id);
        user = userRepo.save(user);
        return modelMapper.map(user, UserProfileResponse.class);
    }

    @Override
    public ResponseEntity<String> deleteUserById(Long id) {
        if(userRepo.existsById(id)){
            Users user = userRepo.findById(id).orElseThrow();
            userRepo.delete(user);
            return ResponseEntity.ok("User is successfully deleted");
        }
        return ResponseEntity.ofNullable("User is not exists in the Db");
    }

    @Override
    public UserProfileResponse getUserByEmail(String email) {
        Users user = userRepo.findByEmail(email);
        UserProfileResponse userProfileResponse = modelMapper.map(user, UserProfileResponse.class);
        return userProfileResponse;
    }

}
