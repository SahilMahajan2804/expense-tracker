package com.studiospeeps.expensetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "expense_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attachmentId;

    @ManyToOne
    @JoinColumn(name = "expense_id")
    private Expense expense;

    private String fileName;
    private String filePath;

    private LocalDateTime uploadedAt;
}
