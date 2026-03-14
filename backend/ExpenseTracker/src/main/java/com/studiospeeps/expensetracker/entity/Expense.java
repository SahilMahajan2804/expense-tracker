package com.studiospeeps.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long expenseId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;   // Employee

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ExpenseCategory category;

    private BigDecimal amount;

    private String description;

    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;

    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    private List<ExpenseApproval> approvals;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    private List<ExpenseAttachment> attachments;
}

