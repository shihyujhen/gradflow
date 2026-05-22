package com.procrastiless.api.repository;

import com.procrastiless.api.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDesc(LocalDate start, LocalDate end);
    List<Expense> findByUserEmailOrderByExpenseDateDesc(String userEmail);
    List<Expense> findByUserEmailAndExpenseDateBetweenOrderByExpenseDateDesc(String userEmail, LocalDate start, LocalDate end);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
