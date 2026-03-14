package com.studiospeeps.expensetracker.dto;

import com.studiospeeps.expensetracker.entity.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long userId;
    private String email;
    private String firstname;
    private String lastname;
    private Role role;
    private String department;
    private String jwtToken;
    private String tokenType;
    private Long expiresIn;  // Token expiry time in milliseconds
    private String message;
}