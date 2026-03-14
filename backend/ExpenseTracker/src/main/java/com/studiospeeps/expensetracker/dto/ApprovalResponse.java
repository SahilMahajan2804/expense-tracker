package com.studiospeeps.expensetracker.dto;

import com.studiospeeps.expensetracker.entity.ApprovalDecision;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalResponse {
    private Long approvalId;
    private Long expenseId;
    private String adminName;
    private ApprovalDecision decision;
    private String remarks;
    private LocalDateTime decisionDate;
}