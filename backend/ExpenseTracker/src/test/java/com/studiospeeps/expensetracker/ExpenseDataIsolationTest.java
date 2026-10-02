package com.studiospeeps.expensetracker;

import com.studiospeeps.expensetracker.entity.Expense;
import com.studiospeeps.expensetracker.entity.ExpenseAttachment;
import com.studiospeeps.expensetracker.entity.Users;
import com.studiospeeps.expensetracker.repo.ExpenseAttachmentRepository;
import com.studiospeeps.expensetracker.repo.ExpenseRepository;
import com.studiospeeps.expensetracker.repo.ExpenseCategoryRepository;
import com.studiospeeps.expensetracker.repo.UserRepository;
import com.studiospeeps.expensetracker.service.impl.ExpenseServiceImpl;
import com.studiospeeps.expensetracker.service.impl.FileStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.access.AccessDeniedException;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseDataIsolationTest {

    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ExpenseCategoryRepository categoryRepository;
    @Mock
    private ExpenseAttachmentRepository attachmentRepository;

    @InjectMocks
    private ExpenseServiceImpl expenseService;
    @InjectMocks
    private FileStorageService fileStorageService;

    @Test
    void employeeCanReadOwnExpense() {
        Expense expense = expenseOwnedBy("owner@example.com");
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        var result = expenseService.getExpenseById(1L, "owner@example.com", false);

        assertEquals("owner@example.com", result.getEmployeeEmail());
    }

    @Test
    void employeeCannotReadAnotherUsersExpense() {
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expenseOwnedBy("owner@example.com")));

        assertThrows(AccessDeniedException.class,
                () -> expenseService.getExpenseById(1L, "other@example.com", false));
    }

    @Test
    void adminCanReadAnotherUsersExpense() {
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expenseOwnedBy("owner@example.com")));

        var result = expenseService.getExpenseById(1L, "admin@example.com", true);

        assertEquals("owner@example.com", result.getEmployeeEmail());
    }

    @Test
    void employeeCannotReadAnotherUsersAttachment() {
        ExpenseAttachment attachment = ExpenseAttachment.builder()
                .expense(expenseOwnedBy("owner@example.com"))
                .filePath("receipt.png")
                .build();
        when(attachmentRepository.findById(1L)).thenReturn(Optional.of(attachment));

        assertThrows(AccessDeniedException.class,
                () -> fileStorageService.downloadFile(1L, "other@example.com", false));
    }

    private Expense expenseOwnedBy(String email) {
        Users owner = Users.builder()
                .email(email)
                .firstname("Expense")
                .lastname("Owner")
                .build();
        return Expense.builder()
                .expenseId(1L)
                .user(owner)
                .amount(BigDecimal.TEN)
                .expenseDate(LocalDate.of(2026, 1, 1))
                .build();
    }
}