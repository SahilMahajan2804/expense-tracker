package com.studiospeeps.expensetracker.controller;

import com.studiospeeps.expensetracker.dto.*;
import com.studiospeeps.expensetracker.entity.ExpenseStatus;
import com.studiospeeps.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "${ALLOWED_ORIGINS}")
public class ExpenseController {

    private final ExpenseService expenseService;

    // ==================== CREATE EXPENSE ====================
    @PostMapping
    public ResponseEntity<?> createExpense(
            Authentication authentication,
            @Valid @RequestBody ExpenseRequest request) {
        try {
            String email = authentication.getName();
            ExpenseResponse expense = expenseService.createExpense(email, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(expense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET MY EXPENSES ====================
    @GetMapping("/my")
    public ResponseEntity<?> getMyExpenses(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<ExpenseResponse> expenses = expenseService.getMyExpenses(email);
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET MY EXPENSES BY STATUS ====================
    @GetMapping("/my/status/{status}")
    public ResponseEntity<?> getMyExpensesByStatus(
            Authentication authentication,
            @PathVariable ExpenseStatus status) {
        try {
            String email = authentication.getName();
            List<ExpenseResponse> expenses = expenseService.getMyExpensesByStatus(email, status);
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== GET EXPENSE BY ID ====================
    @GetMapping("/{expenseId}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long expenseId) {
        try {
            ExpenseResponse expense = expenseService.getExpenseById(expenseId);
            return ResponseEntity.ok(expense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== UPDATE EXPENSE ====================
    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(
            Authentication authentication,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {
        try {
            String email = authentication.getName();
            ExpenseResponse expense = expenseService.updateExpense(expenseId, email, request);
            return ResponseEntity.ok(expense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== DELETE EXPENSE ====================
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            Authentication authentication,
            @PathVariable Long expenseId) {
        try {
            String email = authentication.getName();
            expenseService.deleteExpense(expenseId, email);
            return ResponseEntity.ok("Expense deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== MY DASHBOARD ====================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getMyDashboard(Authentication authentication) {
        try {
            String email = authentication.getName();
            DashboardResponse dashboard = expenseService.getEmployeeDashboard(email);
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}