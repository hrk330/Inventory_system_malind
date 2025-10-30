-- WARNING: This will delete ALL sales and related data!
-- Run this script with caution as it cannot be undone.

-- First, reset customer balances and total purchases
UPDATE customers 
SET 
    balance = 0,
    total_purchases = 0,
    last_purchase_date = NULL;

-- Delete all sales (cascade deletes will handle related records)
-- The order matters due to foreign key constraints

-- Delete sale refunds first (they reference sales)
DELETE FROM sale_refunds;

-- Delete customer payments (they reference sales)
DELETE FROM customer_payments;

-- Delete payments (they reference sales)
DELETE FROM payments;

-- Delete sale items (they reference sales)
DELETE FROM sale_items;

-- Finally, delete all sales
DELETE FROM sales;

-- Verify deletion
SELECT 
    'Sales' as table_name, COUNT(*) as remaining_count FROM sales
UNION ALL
SELECT 
    'Sale Items', COUNT(*) FROM sale_items
UNION ALL
SELECT 
    'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 
    'Customer Payments', COUNT(*) FROM customer_payments
UNION ALL
SELECT 
    'Sale Refunds', COUNT(*) FROM sale_refunds;
