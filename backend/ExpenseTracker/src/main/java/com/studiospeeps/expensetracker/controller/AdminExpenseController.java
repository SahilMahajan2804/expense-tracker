package com.studiospeeps.expensetracker.controller;

import com.studiospeeps.expensetracker.dto.*;
import com.studiospeeps.expensetracker.entity.ExpenseStatus;
import com.studiospeeps.expensetracker.service.ExpenseApprovalService;
import com.studiospeeps.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "${ALLOWED_ORIGINS}")
public class AdminExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseApprovalService approvalService;

    // ==================== GET ALL EXPENSES ====================
    @GetMapping
    public ResponseEntity<?> getAllExpenses() {
        try {
            List<ExpenseResponse> expenses = expenseService.getAllExpenses();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET EXPENSES BY STATUS ====================
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getExpensesByStatus(@PathVariable ExpenseStatus status) {
        try {
            List<ExpenseResponse> expenses = expenseService.getExpensesByStatus(status);
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET PENDING EXPENSES ====================
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingExpenses() {
        try {
            List<ExpenseResponse> expenses = expenseService.getPendingExpenses();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET APPROVED EXPENSES ====================
    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedExpenses() {
        try {
            List<ExpenseResponse> expenses = expenseService.getExpensesByStatus(ExpenseStatus.APPROVED);
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET REJECTED EXPENSES ====================
    @GetMapping("/rejected")
    public ResponseEntity<?> getRejectedExpenses() {
        try {
            List<ExpenseResponse> expenses = expenseService.getExpensesByStatus(ExpenseStatus.REJECTED);
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== APPROVE EXPENSE ====================
    @PostMapping("/{expenseId}/approve")
    public ResponseEntity<?> approveExpense(
            Authentication authentication,
            @PathVariable Long expenseId,
            @RequestParam(required = false) String remarks) {
        try {
            String adminEmail = authentication.getName();
            ApprovalResponse approval = approvalService.approveExpense(expenseId, adminEmail, remarks);
            return ResponseEntity.ok(approval);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== REJECT EXPENSE ====================
    @PostMapping("/{expenseId}/reject")
    public ResponseEntity<?> rejectExpense(
            Authentication authentication,
            @PathVariable Long expenseId,
            @RequestParam(required = false) String remarks) {
        try {
            String adminEmail = authentication.getName();
            ApprovalResponse approval = approvalService.rejectExpense(expenseId, adminEmail, remarks);
            return ResponseEntity.ok(approval);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== PROCESS EXPENSE (Generic) ====================
    @PostMapping("/{expenseId}/process")
    public ResponseEntity<?> processExpense(
            Authentication authentication,
            @PathVariable Long expenseId,
            @Valid @RequestBody ApprovalRequest request) {
        try {
            String adminEmail = authentication.getName();
            ApprovalResponse approval = approvalService.processExpense(expenseId, adminEmail, request);
            return ResponseEntity.ok(approval);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET MY APPROVALS (Admin's history) ====================
    @GetMapping("/my-approvals")
    public ResponseEntity<?> getMyApprovals(Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            List<ApprovalResponse> approvals = approvalService.getMyApprovals(adminEmail);
            return ResponseEntity.ok(approvals);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET EXPENSE APPROVAL HISTORY ====================
    @GetMapping("/{expenseId}/approvals")
    public ResponseEntity<?> getExpenseApprovals(@PathVariable Long expenseId) {
        try {
            List<ApprovalResponse> approvals = approvalService.getApprovalsByExpense(expenseId);
            return ResponseEntity.ok(approvals);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== ADMIN DASHBOARD ====================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        try {
            DashboardResponse dashboard = expenseService.getAdminDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}