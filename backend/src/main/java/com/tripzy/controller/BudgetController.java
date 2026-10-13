package com.tripzy.controller;

import com.tripzy.dto.PlanDtos.CreateExpenseRequest;
import com.tripzy.entity.Expense;
import com.tripzy.security.UserPrincipal;
import com.tripzy.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping("/groups/{groupId}/expenses")
    public ResponseEntity<Expense> createExpense(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long groupId,
                                                 @Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.ok(budgetService.createExpense(principal.getId(), groupId, request));
    }

    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<List<Expense>> getGroupExpenses(@PathVariable Long groupId) {
        return ResponseEntity.ok(budgetService.getGroupExpenses(groupId));
    }

    @GetMapping("/groups/{groupId}/balances")
    public ResponseEntity<Map<String, Object>> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(budgetService.calculateBalances(groupId));
    }
}
