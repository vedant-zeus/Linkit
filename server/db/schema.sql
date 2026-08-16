-- ============================================================
--  LINKIT — Database Schema
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS linkit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE linkit_db;

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  username       VARCHAR(50)  UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('admin','user') DEFAULT 'user',
  customer_segment VARCHAR(50) DEFAULT 'standard',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  product_id    INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  base_price    DECIMAL(10,2) NOT NULL,
  cost_price    DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  stock         INT NOT NULL DEFAULT 0,
  reorder_point INT NOT NULL DEFAULT 10,
  views         INT DEFAULT 0,
  image_url     VARCHAR(500) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Transactions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT,
  product_id     INT NOT NULL,
  quantity       INT NOT NULL DEFAULT 1,
  price          DECIMAL(10,2) NOT NULL,
  timestamp      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(user_id)    ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ── Product Views ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_views (
  view_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  product_id INT NOT NULL,
  timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(user_id)    ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ── Price History ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
  price_id   INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  old_price  DECIMAL(10,2) NOT NULL,
  new_price  DECIMAL(10,2) NOT NULL,
  reason     VARCHAR(255) DEFAULT 'Manual update',
  timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ── Market Data (Competitor Prices) ────────────────────────
CREATE TABLE IF NOT EXISTS market_data (
  market_id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id        INT NOT NULL,
  competitor_price  DECIMAL(10,2) NOT NULL,
  source            VARCHAR(100) DEFAULT 'market_feed',
  timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ── Pricing Recommendations ─────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_recommendations (
  recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id        INT NOT NULL,
  recommended_price DECIMAL(10,2) NOT NULL,
  demand_score      DECIMAL(4,3),
  inventory_score   DECIMAL(4,3),
  market_score      DECIMAL(4,3),
  behavior_score    DECIMAL(4,3),
  seasonal_score    DECIMAL(4,3),
  weighted_score    DECIMAL(4,3),
  predicted_demand  DECIMAL(8,2),
  predicted_profit  DECIMAL(12,2),
  applied           BOOLEAN DEFAULT FALSE,
  timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
