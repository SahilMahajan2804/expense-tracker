package com.studiospeeps.expensetracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResponse {

    private String email;
    private String message;
    private boolean verified;
}