package com.studiospeeps.expensetracker.repo;

import com.studiospeeps.expensetracker.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    Optional<ExpenseCategory> findByCategoryName(String categoryName);
    List<ExpenseCategory> findByIsActiveTrue();
    boolean existsByCategoryName(String categoryName);
}