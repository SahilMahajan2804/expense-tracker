package com.studiospeeps.expensetracker.dto;

import com.studiospeeps.expensetracker.entity.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String department;
    private Role role;
    @JsonProperty("isVerified")
    private boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}