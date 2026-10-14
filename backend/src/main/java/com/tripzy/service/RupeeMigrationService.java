package com.tripzy.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * One-time conversion of data created while Tripzy priced things in US dollars.
 * Tripzy now shows every amount in Indian rupees, so dollar-era rows are converted on startup.
 * Safe to run on every start: converted rows are marked INR or are already in rupee range.
 */
@Service
@Order(10)
public class RupeeMigrationService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RupeeMigrationService.class);
    private static final int USD_TO_INR = 85;
    // Amounts below this were entered as dollars (no realistic trip or daily budget is under ₹1,000)
    private static final int DOLLAR_RANGE_LIMIT = 1000;

    // Demo data gets the same rupee prices a fresh install seeds
    private static final Map<String, Double> DESTINATION_DAILY_INR = Map.of(
            "Manali", 2500.0, "Ladakh", 3500.0, "Goa", 3000.0,
            "Kyoto", 12000.0, "Santorini", 15000.0, "Swiss Alps (Zermatt)", 20000.0);
    private static final Map<String, Double> TRIP_INR = Map.of(
            "Himalayan Snow Peaks Expedition", 18500.0,
            "High-Pass Motorcycle & Stargazing Adventure", 32000.0,
            "Coastal Sunset Surf & Reggae Retreat", 14500.0,
            "Aegean Caldera Sailing & Sunset Chasing", 125000.0,
            "Ancient Shrines & Zen Tea Gardens", 110000.0);
    private static final Map<String, Double> ITINERARY_ITEM_INR = Map.of(
            "Old Manali Check-in & Cedar Forest Walk", 800.0,
            "Solang Valley Snow Activities & Cable Car", 2500.0,
            "Arrival & Scenic Orientation", 500.0,
            "Morning Landmark Exploration", 500.0,
            "Local Cuisine & Adventure Activity", 1500.0,
            "Sunset Gathering & Night Market", 1200.0);

    private final JdbcTemplate jdbc;

    public RupeeMigrationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int changed = 0;

        for (Map.Entry<String, Double> d : DESTINATION_DAILY_INR.entrySet()) {
            changed += jdbc.update(
                    "UPDATE destinations SET avg_budget_per_day = ?, currency = 'INR' WHERE name = ? AND avg_budget_per_day < ?",
                    d.getValue(), d.getKey(), DOLLAR_RANGE_LIMIT);
        }
        changed += jdbc.update(
                "UPDATE destinations SET avg_budget_per_day = ROUND(avg_budget_per_day * ? / 100) * 100 WHERE avg_budget_per_day < ?",
                USD_TO_INR, DOLLAR_RANGE_LIMIT);
        changed += jdbc.update("UPDATE destinations SET currency = 'INR' WHERE currency IS NULL OR currency <> 'INR'");

        for (Map.Entry<String, Double> t : TRIP_INR.entrySet()) {
            changed += jdbc.update(
                    "UPDATE trips SET estimated_budget = ?, currency = 'INR' WHERE title = ? AND estimated_budget < ?",
                    t.getValue(), t.getKey(), DOLLAR_RANGE_LIMIT);
        }
        changed += jdbc.update(
                "UPDATE trips SET estimated_budget = ROUND(estimated_budget * ? / 100) * 100 WHERE estimated_budget < ?",
                USD_TO_INR, DOLLAR_RANGE_LIMIT);
        changed += jdbc.update("UPDATE trips SET currency = 'INR' WHERE currency IS NULL OR currency <> 'INR'");

        // Expenses recorded in another currency, and their per-member shares
        changed += jdbc.update(
                "UPDATE expense_shares s JOIN expenses e ON s.expense_id = e.id " +
                "SET s.share_amount = ROUND(s.share_amount * ?, 2) WHERE e.currency IS NULL OR e.currency <> 'INR'", USD_TO_INR);
        changed += jdbc.update(
                "UPDATE expenses SET amount = ROUND(amount * ?, 2), currency = 'INR' WHERE currency IS NULL OR currency <> 'INR'", USD_TO_INR);

        // Itinerary items generated or seeded with dollar costs
        for (Map.Entry<String, Double> item : ITINERARY_ITEM_INR.entrySet()) {
            changed += jdbc.update(
                    "UPDATE itinerary_items SET estimated_cost = ? WHERE title = ? AND estimated_cost > 0 AND estimated_cost < 100",
                    item.getValue(), item.getKey());
        }

        if (changed > 0) {
            log.info("Converted {} dollar-priced rows to Indian rupees", changed);
        }
    }
}
