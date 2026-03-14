package com.studiospeeps.expensetracker.service.impl;

import com.studiospeeps.expensetracker.dto.*;
import com.studiospeeps.expensetracker.entity.*;
import com.studiospeeps.expensetracker.repo.*;
import com.studiospeeps.expensetracker.service.ExpenseApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseApprovalServiceImpl implements ExpenseApprovalService {

    private final ExpenseApprovalRepository approvalRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepo;

    @Transactional
    public ApprovalResponse processExpense(Long expenseId, String adminEmail, ApprovalRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        Users admin = userRepo.findByEmail(adminEmail);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }

        // Verify admin role
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can approve/reject expenses");
        }

        // Check if already processed
        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new RuntimeException("Expense has already been processed");
        }

        // Create approval record
        ExpenseApproval approval = ExpenseApproval.builder()
                .expense(expense)
                .admin(admin)
                .decision(request.getDecision())
                .remarks(request.getRemarks())
                .decisionDate(LocalDateTime.now())
                .build();

        // Update expense status
        if (request.getDecision() == ApprovalDecision.APPROVED) {
            expense.setStatus(ExpenseStatus.APPROVED);
        } else {
            expense.setStatus(ExpenseStatus.REJECTED);
        }
        expense.setUpdatedAt(LocalDateTime.now());

        expenseRepository.save(expense);
        ExpenseApproval savedApproval = approvalRepository.save(approval);

        return mapToResponse(savedApproval);
    }

    @Transactional
    public ApprovalResponse approveExpense(Long expenseId, String adminEmail, String remarks) {
        ApprovalRequest request = ApprovalRequest.builder()
                .decision(ApprovalDecision.APPROVED)
                .remarks(remarks)
                .build();
        return processExpense(expenseId, adminEmail, request);
    }

    @Transactional
    public ApprovalResponse rejectExpense(Long expenseId, String adminEmail, String remarks) {
        ApprovalRequest request = ApprovalRequest.builder()
                .decision(ApprovalDecision.REJECTED)
                .remarks(remarks)
                .build();
        return processExpense(expenseId, adminEmail, request);
    }

    public List<ApprovalResponse> getMyApprovals(String adminEmail) {
        Users admin = userRepo.findByEmail(adminEmail);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }

        return approvalRepository.findByAdminOrderByDecisionDateDesc(admin).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApprovalResponse> getApprovalsByExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        return approvalRepository.findByExpense(expense).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ApprovalResponse mapToResponse(ExpenseApproval approval) {
        return ApprovalResponse.builder()
                .approvalId(approval.getApprovalId())
                .expenseId(approval.getExpense().getExpenseId())
                .adminName(approval.getAdmin().getFirstname() + " " + approval.getAdmin().getLastname())
                .decision(approval.getDecision())
                .remarks(approval.getRemarks())
                .decisionDate(approval.getDecisionDate())
                .build();
    }
}