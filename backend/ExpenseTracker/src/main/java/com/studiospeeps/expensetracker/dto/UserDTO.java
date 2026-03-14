package com.studiospeeps.expensetracker.dto;

import com.studiospeeps.expensetracker.entity.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String department;
    private Role role;
    private boolean isVerified;
}