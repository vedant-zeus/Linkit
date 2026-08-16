-- ============================================================
--  LINKIT — Seed Data
--  Run AFTER schema.sql
-- ============================================================
USE linkit_db;

-- ── Users (passwords are bcrypt of "admin123" / "user123") ─
INSERT INTO users (name, email, username, password_hash, role, customer_segment) VALUES
('Admin User',   'admin@linkit.com', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'internal'),
('Rahul Sharma', 'rahul@example.com', 'user',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWIG/igi', 'user',  'premium'),
('Priya Singh',  'priya@example.com', 'priya', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWIG/igi', 'user',  'standard'),
('Amit Patel',   'amit@example.com',  'amit',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWIG/igi', 'user',  'budget');

-- ── Products (5 categories, 15 products) ───────────────────
INSERT INTO products (name, category, base_price, cost_price, current_price, stock, reorder_point, views) VALUES
-- Electronics
('Wireless Noise-Cancelling Headphones', 'Electronics',  8999.00, 4500.00,  8999.00, 45,  10, 1820),
('Mechanical Gaming Keyboard',           'Electronics',  5499.00, 2700.00,  5499.00, 30,   8, 1240),
('4K Webcam Pro',                        'Electronics',  3999.00, 1800.00,  3999.00, 22,   5,  980),
('Smart LED Desk Lamp',                  'Electronics',  1999.00,  800.00,  1999.00, 60,  15,  640),
('Portable Bluetooth Speaker',           'Electronics',  2499.00, 1100.00,  2499.00, 38,  10, 1100),

-- Footwear
('Nike Air Max Running Shoes',           'Footwear',     7999.00, 3200.00,  7999.00, 18,   8, 2340),
('Adidas Ultraboost 22',                 'Footwear',     9999.00, 4500.00,  9999.00, 12,   5, 1890),
('Casual Canvas Sneakers',               'Footwear',     1999.00,  700.00,  1999.00, 80,  20,  520),

-- Clothing
('Premium Cotton T-Shirt (Pack of 3)',   'Clothing',     1499.00,  500.00,  1499.00, 120, 30,  430),
('Slim Fit Denim Jeans',                 'Clothing',     2499.00,  900.00,  2499.00, 65,  15,  780),
('Waterproof Windbreaker Jacket',        'Clothing',     4499.00, 1800.00,  4499.00, 25,   8, 1020),

-- Home & Kitchen
('Stainless Steel Water Bottle 1L',      'Home & Kitchen', 699.00, 200.00,   699.00, 200, 50,  320),
('Air Fryer 4.5L Digital',              'Home & Kitchen',3999.00, 1600.00,  3999.00, 28,   8, 1560),
('Bamboo Cutting Board Set',             'Home & Kitchen', 899.00, 280.00,   899.00, 90,  20,  210),

-- Sports
('Yoga Mat Anti-Slip 6mm',              'Sports',         999.00, 320.00,   999.00, 55,  15,  680);

-- ── Transactions (last 30 days, varied volumes) ─────────────
-- Product 1 — Headphones (high demand)
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(2, 1, 1, 8999.00, DATE_SUB(NOW(), INTERVAL 29 DAY)),
(3, 1, 1, 8999.00, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(2, 1, 2, 8999.00, DATE_SUB(NOW(), INTERVAL 26 DAY)),
(4, 1, 1, 8999.00, DATE_SUB(NOW(), INTERVAL 24 DAY)),
(3, 1, 1, 8999.00, DATE_SUB(NOW(), INTERVAL 22 DAY)),
(2, 1, 1, 8799.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 1, 2, 8799.00, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(3, 1, 1, 8999.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 1, 1, 9199.00, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(4, 1, 1, 9199.00, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(3, 1, 2, 9199.00, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 1, 1, 9399.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 1, 1, 9399.00, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Product 6 — Nike Shoes (very high demand)
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(2, 6, 1, 7999.00, DATE_SUB(NOW(), INTERVAL 29 DAY)),
(3, 6, 2, 7999.00, DATE_SUB(NOW(), INTERVAL 27 DAY)),
(4, 6, 1, 7999.00, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 6, 1, 7999.00, DATE_SUB(NOW(), INTERVAL 23 DAY)),
(3, 6, 1, 8199.00, DATE_SUB(NOW(), INTERVAL 21 DAY)),
(4, 6, 2, 8199.00, DATE_SUB(NOW(), INTERVAL 19 DAY)),
(2, 6, 1, 8199.00, DATE_SUB(NOW(), INTERVAL 17 DAY)),
(3, 6, 1, 8399.00, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(4, 6, 1, 8399.00, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(2, 6, 2, 8399.00, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 6, 1, 8599.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 6, 1, 8599.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 6, 2, 8599.00, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Product 7 — Adidas (moderate demand)
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(3, 7, 1, 9999.00, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(2, 7, 1, 9999.00, DATE_SUB(NOW(), INTERVAL 22 DAY)),
(4, 7, 1, 9799.00, DATE_SUB(NOW(), INTERVAL 16 DAY)),
(3, 7, 2, 9799.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 7, 1, 9999.00, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Product 13 — Air Fryer (growing demand)
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(2, 13, 1, 3999.00, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(3, 13, 1, 3999.00, DATE_SUB(NOW(), INTERVAL 23 DAY)),
(4, 13, 2, 3999.00, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(2, 13, 1, 4199.00, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(3, 13, 1, 4199.00, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(4, 13, 1, 4199.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 13, 2, 4199.00, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Product 2 — Keyboard
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(2, 2, 1, 5499.00, DATE_SUB(NOW(), INTERVAL 27 DAY)),
(3, 2, 1, 5499.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 2, 2, 5299.00, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(2, 2, 1, 5499.00, DATE_SUB(NOW(), INTERVAL 6 DAY));

-- Product 3 — Webcam
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(3, 3, 1, 3999.00, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 3, 2, 3799.00, DATE_SUB(NOW(), INTERVAL 17 DAY)),
(4, 3, 1, 3999.00, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(3, 3, 1, 4199.00, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Product 10 — Denim Jeans
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(2, 10, 2, 2499.00, DATE_SUB(NOW(), INTERVAL 26 DAY)),
(3, 10, 1, 2499.00, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(4, 10, 3, 2299.00, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(2, 10, 1, 2499.00, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Product 15 — Yoga Mat
INSERT INTO transactions (user_id, product_id, quantity, price, timestamp) VALUES
(3, 15, 2, 999.00, DATE_SUB(NOW(), INTERVAL 24 DAY)),
(4, 15, 1, 999.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 15, 3, 999.00, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3, 15, 1, 1099.00, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── Price History ───────────────────────────────────────────
INSERT INTO price_history (product_id, old_price, new_price, reason, timestamp) VALUES
(1, 8999.00, 8799.00, 'Inventory build-up', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(1, 8799.00, 8999.00, 'Demand recovery', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(1, 8999.00, 9199.00, 'High demand + low inventory', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 9199.00, 9399.00, 'Pricing engine recommendation', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 7999.00, 8199.00, 'Festival season demand surge', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 8199.00, 8399.00, 'Competitor price increase', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(6, 8399.00, 8599.00, 'Pricing engine recommendation', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, 9999.00, 9799.00, 'Slow sales — price reduction', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(7, 9799.00, 9999.00, 'Restocked — back to base', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(13,3999.00, 4199.00, 'Demand spike — pricing engine', DATE_SUB(NOW(), INTERVAL 14 DAY));

-- ── Market Data (Competitor Prices) ────────────────────────
INSERT INTO market_data (product_id, competitor_price, source, timestamp) VALUES
(1,  9499.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1,  8799.00, 'flipkart',  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2,  5999.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3,  4299.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5,  2699.00, 'flipkart',  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6,  8299.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6,  7999.00, 'myntra',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 10499.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7,  9799.00, 'myntra',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10, 2799.00, 'myntra',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 4999.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(13, 4499.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY)),
(13, 3899.00, 'flipkart',  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(15, 1199.00, 'amazon',    DATE_SUB(NOW(), INTERVAL 1 DAY));
