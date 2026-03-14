package com.studiospeeps.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long approvalId;

    @ManyToOne
    @JoinColumn(name = "expense_id")
    private Expense expense;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Users admin;

    @Enumerated(EnumType.STRING)
    private ApprovalDecision decision;

    private String remarks;

    private LocalDateTime decisionDate;
}





