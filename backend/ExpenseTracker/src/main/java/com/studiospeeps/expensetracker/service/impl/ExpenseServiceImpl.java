package com.studiospeeps.expensetracker.service.impl;

import com.studiospeeps.expensetracker.dto.*;
import com.studiospeeps.expensetracker.entity.*;
import com.studiospeeps.expensetracker.repo.*;
import com.studiospeeps.expensetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepo;
    private final ExpenseCategoryRepository categoryRepository;

    @Transactional
    public ExpenseResponse createExpense(String email, ExpenseRequest request) {
        Users user = userRepo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .status(ExpenseStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        return mapToResponse(savedExpense);
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return mapToResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getMyExpenses(String email) {
        Users user = userRepo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return expenseRepository.findByUserOrderBySubmittedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getMyExpensesByStatus(String email, ExpenseStatus status) {
        Users user = userRepo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return expenseRepository.findByUserAndStatus(user, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAllOrderBySubmittedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByStatus(ExpenseStatus status) {
        return expenseRepository.findByStatusOrderBySubmittedAtDesc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getPendingExpenses() {
        return getExpensesByStatus(ExpenseStatus.PENDING);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long expenseId, String email, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Only allow update if expense belongs to user
        if (!expense.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: You can only update your own expenses");
        }

        // Only allow update if still pending
        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new RuntimeException("Cannot update expense that is already processed");
        }

        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        expense.setCategory(category);
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setUpdatedAt(LocalDateTime.now());

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToResponse(updatedExpense);
    }

    @Transactional
    public void deleteExpense(Long expenseId, String email) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: You can only delete your own expenses");
        }

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new RuntimeException("Cannot delete expense that is already processed");
        }

        expenseRepository.delete(expense);
    }

    // Dashboard for Employee
    public DashboardResponse getEmployeeDashboard(String email) {
        Users user = userRepo.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Long total = (long) expenseRepository.findByUser(Optional.of(user)).size();
        Long pending = expenseRepository.countByUserAndStatus(user, ExpenseStatus.PENDING);
        Long approved = expenseRepository.countByUserAndStatus(user, ExpenseStatus.APPROVED);
        Long rejected = expenseRepository.countByUserAndStatus(user, ExpenseStatus.REJECTED);

        return DashboardResponse.builder()
                .totalExpenses(total)
                .pendingExpenses(pending)
                .approvedExpenses(approved)
                .rejectedExpenses(rejected)
                .totalAmount(expenseRepository.sumAmountByUser(user))
                .approvedAmount(expenseRepository.sumAmountByUserAndStatus(user, ExpenseStatus.APPROVED))
                .pendingAmount(expenseRepository.sumAmountByUserAndStatus(user, ExpenseStatus.PENDING))
                .categoryBreakdown(getCategoryBreakdown(expenseRepository.findByUserOrderBySubmittedAtDesc(user)))
                .monthlyTrends(getMonthlyTrends(expenseRepository.findByUserOrderBySubmittedAtDesc(user)))
                .build();
    }

    // Dashboard for Admin
    public DashboardResponse getAdminDashboard() {
        Long total = expenseRepository.count();
        Long pending = expenseRepository.countByStatus(ExpenseStatus.PENDING);
        Long approved = expenseRepository.countByStatus(ExpenseStatus.APPROVED);
        Long rejected = expenseRepository.countByStatus(ExpenseStatus.REJECTED);

        List<Expense> allExpenses = expenseRepository.findAll();
        
        return DashboardResponse.builder()
                .totalExpenses(total)
                .pendingExpenses(pending)
                .approvedExpenses(approved)
                .rejectedExpenses(rejected)
                .totalAmount(expenseRepository.sumAmountByStatus(ExpenseStatus.APPROVED)
                        .add(expenseRepository.sumAmountByStatus(ExpenseStatus.PENDING))
                        .add(expenseRepository.sumAmountByStatus(ExpenseStatus.REJECTED)))
                .approvedAmount(expenseRepository.sumAmountByStatus(ExpenseStatus.APPROVED))
                .pendingAmount(expenseRepository.sumAmountByStatus(ExpenseStatus.PENDING))
                .categoryBreakdown(getCategoryBreakdown(allExpenses))
                .monthlyTrends(getMonthlyTrends(allExpenses))
                .build();
    }

    private Map<String, BigDecimal> getCategoryBreakdown(List<Expense> expenses) {
        return expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getCategoryName(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    private Map<String, BigDecimal> getMonthlyTrends(List<Expense> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getExpenseDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        List<AttachmentResponse> attachments = null;
        if (expense.getAttachments() != null) {
            attachments = expense.getAttachments().stream()
                    .map(att -> AttachmentResponse.builder()
                            .attachmentId(att.getAttachmentId())
                            .fileName(att.getFileName())
                            .filePath(att.getFilePath())
                            .uploadedAt(att.getUploadedAt())
                            .build())
                    .collect(Collectors.toList());
        }

        List<ApprovalResponse> approvals = null;
        if (expense.getApprovals() != null) {
            approvals = expense.getApprovals().stream()
                    .map(app -> ApprovalResponse.builder()
                            .approvalId(app.getApprovalId())
                            .expenseId(expense.getExpenseId())
                            .adminName(app.getAdmin().getFirstname() + " " + app.getAdmin().getLastname())
                            .decision(app.getDecision())
                            .remarks(app.getRemarks())
                            .decisionDate(app.getDecisionDate())
                            .build())
                    .collect(Collectors.toList());
        }

        return ExpenseResponse.builder()
                .expenseId(expense.getExpenseId())
                .employeeName(expense.getUser().getFirstname() + " " + expense.getUser().getLastname())
                .employeeEmail(expense.getUser().getEmail())
                .categoryName(expense.getCategory() != null ? expense.getCategory().getCategoryName() : null)
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .status(expense.getStatus())
                .submittedAt(expense.getSubmittedAt())
                .updatedAt(expense.getUpdatedAt())
                .attachments(attachments)
                .approvals(approvals)
                .build();
    }
}