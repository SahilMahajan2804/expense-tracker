package com.studiospeeps.expensetracker.service;

import com.studiospeeps.expensetracker.dto.ApprovalRequest;
import com.studiospeeps.expensetracker.dto.ApprovalResponse;
import jakarta.validation.Valid;

import java.util.List;

public interface ExpenseApprovalService {
    ApprovalResponse approveExpense(Long expenseId, String adminEmail, String remarks);

    ApprovalResponse rejectExpense(Long expenseId, String adminEmail, String remarks);

    ApprovalResponse processExpense(Long expenseId, String adminEmail, @Valid ApprovalRequest request);

    List<ApprovalResponse> getMyApprovals(String adminEmail);

    List<ApprovalResponse> getApprovalsByExpense(Long expenseId);
}
