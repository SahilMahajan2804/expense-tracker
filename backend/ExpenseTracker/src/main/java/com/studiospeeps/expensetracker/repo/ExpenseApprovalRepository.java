package com.studiospeeps.expensetracker.repo;

import com.studiospeeps.expensetracker.entity.ExpenseApproval;
import com.studiospeeps.expensetracker.entity.Expense;
import com.studiospeeps.expensetracker.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseApprovalRepository extends JpaRepository<ExpenseApproval, Long> {
    List<ExpenseApproval> findByExpense(Expense expense);
    List<ExpenseApproval> findByAdmin(Users admin);
    List<ExpenseApproval> findByAdminOrderByDecisionDateDesc(Users admin);
    Optional<ExpenseApproval> findByExpenseAndAdmin(Expense expense, Users admin);
}