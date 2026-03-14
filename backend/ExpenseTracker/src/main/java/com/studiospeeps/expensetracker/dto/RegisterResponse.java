package com.studiospeeps.expensetracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponse {

    private Long userId;
    private String email;
    private String firstname;
    private String lastname;
    private String registerMessage;
    private boolean requiresVerification;
}