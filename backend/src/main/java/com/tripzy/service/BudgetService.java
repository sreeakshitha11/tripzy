package com.tripzy.service;

import com.tripzy.dto.PlanDtos.CreateExpenseRequest;
import com.tripzy.entity.*;
import com.tripzy.exception.BadRequestException;
import com.tripzy.exception.ResourceNotFoundException;
import com.tripzy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BudgetService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository shareRepository;
    private final TravelGroupRepository groupRepository;
    private final TripParticipantRepository participantRepository;
    private final UserRepository userRepository;

    public BudgetService(ExpenseRepository expenseRepository,
                         ExpenseShareRepository shareRepository,
                         TravelGroupRepository groupRepository,
                         TripParticipantRepository participantRepository,
                         UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.shareRepository = shareRepository;
        this.groupRepository = groupRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Expense createExpense(Long userId, Long groupId, CreateExpenseRequest request) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!participantRepository.existsByTripIdAndUserId(group.getTripId(), userId)) {
            throw new BadRequestException("Only group members can record expenses");
        }

        Expense expense = new Expense();
        expense.setGroupId(groupId);
        expense.setPayerId(user.getId());
        expense.setPayerName(user.getFullName());
        expense.setTitle(request.getTitle());
        expense.setCategory(request.getCategory() != null ? request.getCategory() : "Food & Dining");
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        expense.setDate(LocalDate.now());
        expense.setSplitType(request.getSplitType() != null ? request.getSplitType() : "EQUAL");
        expense.setNotes(request.getNotes());
        expense.setCreatedAt(LocalDateTime.now());

        Expense saved = expenseRepository.save(expense);

        // Calculate shares
        List<TripParticipant> participants = participantRepository.findByTripId(group.getTripId());
        int count = Math.max(1, participants.size());
        double perPerson = Math.round((request.getAmount() / count) * 100.0) / 100.0;

        for (TripParticipant p : participants) {
            ExpenseShare share = new ExpenseShare(saved.getId(), p.getUserId(), p.getUserFullName(), perPerson);
            shareRepository.save(share);
        }

        return saved;
    }

    public List<Expense> getGroupExpenses(Long groupId) {
        return expenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    public Map<String, Object> calculateBalances(Long groupId) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        List<TripParticipant> participants = participantRepository.findByTripId(group.getTripId());
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId);

        Map<Long, Double> paidMap = new HashMap<>();
        Map<Long, Double> owedMap = new HashMap<>();
        Map<Long, String> nameMap = new HashMap<>();

        for (TripParticipant p : participants) {
            paidMap.put(p.getUserId(), 0.0);
            owedMap.put(p.getUserId(), 0.0);
            nameMap.put(p.getUserId(), p.getUserFullName());
        }

        double totalGroupExpenses = 0.0;
        for (Expense e : expenses) {
            totalGroupExpenses += e.getAmount();
            paidMap.put(e.getPayerId(), paidMap.getOrDefault(e.getPayerId(), 0.0) + e.getAmount());

            List<ExpenseShare> shares = shareRepository.findByExpenseId(e.getId());
            for (ExpenseShare s : shares) {
                owedMap.put(s.getUserId(), owedMap.getOrDefault(s.getUserId(), 0.0) + s.getShareAmount());
            }
        }

        List<Map<String, Object>> memberSummaries = new ArrayList<>();
        for (TripParticipant p : participants) {
            double paid = Math.round(paidMap.getOrDefault(p.getUserId(), 0.0) * 100.0) / 100.0;
            double owed = Math.round(owedMap.getOrDefault(p.getUserId(), 0.0) * 100.0) / 100.0;
            double net = Math.round((paid - owed) * 100.0) / 100.0;

            Map<String, Object> m = new HashMap<>();
            m.put("userId", p.getUserId());
            m.put("name", p.getUserFullName());
            m.put("avatar", p.getUserAvatarUrl());
            m.put("totalPaid", paid);
            m.put("totalOwed", owed);
            m.put("netBalance", net); // positive = owed money, negative = owes money
            memberSummaries.add(m);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalGroupExpenses", Math.round(totalGroupExpenses * 100.0) / 100.0);
        response.put("memberSummaries", memberSummaries);
        response.put("disclaimer", "Balances are mathematical calculations for shared budgeting and do not represent actual bank transfers.");

        return response;
    }
}
