package com.studiospeeps.expensetracker.dto;

import com.studiospeeps.expensetracker.entity.ApprovalDecision;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRequest {

    @NotNull(message = "Decision is required")
    private ApprovalDecision decision;

    private String remarks;
}