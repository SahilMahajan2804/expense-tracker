package com.studiospeeps.expensetracker.repo;

import com.studiospeeps.expensetracker.entity.ExpenseAttachment;
import com.studiospeeps.expensetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseAttachmentRepository extends JpaRepository<ExpenseAttachment, Long> {
    List<ExpenseAttachment> findByExpense(Expense expense);
}