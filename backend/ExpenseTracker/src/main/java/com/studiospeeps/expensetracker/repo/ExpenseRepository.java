package com.studiospeeps.expensetracker.repo;

import com.studiospeeps.expensetracker.entity.Expense;
import com.studiospeeps.expensetracker.entity.ExpenseStatus;
import com.studiospeeps.expensetracker.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(Optional<Users> user);

    List<Expense> findByUserOrderBySubmittedAtDesc(Users user);

    List<Expense> findByStatus(ExpenseStatus status);

    List<Expense> findByStatusOrderBySubmittedAtDesc(ExpenseStatus status);

    List<Expense> findByUserAndStatus(Users user, ExpenseStatus status);

    @Query("SELECT e FROM Expense e ORDER BY e.submittedAt DESC")
    List<Expense> findAllOrderBySubmittedAtDesc();

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId ORDER BY e.submittedAt DESC")
    List<Expense> findByUserIdOrderBySubmittedAtDesc(@Param("userId") Long userId);

    // Dashboard queries
    Long countByStatus(ExpenseStatus status);

    Long countByUserAndStatus(Users user, ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user = :user AND e.status = :status")
    BigDecimal sumAmountByUserAndStatus(@Param("user") Users user, @Param("status") ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user = :user")
    BigDecimal sumAmountByUser(@Param("user") Users user);
}