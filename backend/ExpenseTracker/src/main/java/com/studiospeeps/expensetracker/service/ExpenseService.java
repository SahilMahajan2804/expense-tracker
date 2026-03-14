package com.studiospeeps.expensetracker.service;


import com.studiospeeps.expensetracker.dto.DashboardResponse;
import com.studiospeeps.expensetracker.dto.ExpenseRequest;
import com.studiospeeps.expensetracker.dto.ExpenseResponse;
import com.studiospeeps.expensetracker.entity.ExpenseStatus;
import jakarta.validation.Valid;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse createExpense(String email, @Valid ExpenseRequest request);

    List<ExpenseResponse> getMyExpenses(String email);

    List<ExpenseResponse> getMyExpensesByStatus(String email, ExpenseStatus status);

    ExpenseResponse getExpenseById(Long expenseId);

    ExpenseResponse updateExpense(Long expenseId, String email, @Valid ExpenseRequest request);

    void deleteExpense(Long expenseId, String email);

    DashboardResponse getEmployeeDashboard(String email);

    List<ExpenseResponse> getAllExpenses();

    List<ExpenseResponse> getExpensesByStatus(ExpenseStatus status);

    List<ExpenseResponse> getPendingExpenses();

    DashboardResponse getAdminDashboard();
}
