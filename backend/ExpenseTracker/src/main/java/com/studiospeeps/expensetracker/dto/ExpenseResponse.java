package com.studiospeeps.expensetracker.dto;

import com.studiospeeps.expensetracker.entity.ExpenseStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {
    private Long expenseId;
    private String employeeName;
    private String employeeEmail;
    private String categoryName;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private ExpenseStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private List<AttachmentResponse> attachments;
    private List<ApprovalResponse> approvals;
}