package com.tripzy.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "expense_shares")
public class ExpenseShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long expenseId;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private Double shareAmount;

    private Boolean isSettled = false;

    public ExpenseShare() {}

    public ExpenseShare(Long expenseId, Long userId, String userName, Double shareAmount) {
        this.expenseId = expenseId;
        this.userId = userId;
        this.userName = userName;
        this.shareAmount = shareAmount;
        this.isSettled = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getExpenseId() { return expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Double getShareAmount() { return shareAmount; }
    public void setShareAmount(Double shareAmount) { this.shareAmount = shareAmount; }

    public Boolean getIsSettled() { return isSettled; }
    public void setIsSettled(Boolean isSettled) { this.isSettled = isSettled; }
}
