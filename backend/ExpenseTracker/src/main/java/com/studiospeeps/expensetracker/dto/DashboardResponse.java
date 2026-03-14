package com.studiospeeps.expensetracker.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalExpenses;
    private Long pendingExpenses;
    private Long approvedExpenses;
    private Long rejectedExpenses;
    private BigDecimal totalAmount;
    private BigDecimal approvedAmount;
    private BigDecimal pendingAmount;
    private Map<String, BigDecimal> categoryBreakdown;
    private Map<String, BigDecimal> monthlyTrends;
}