CREATE DATABASE IF NOT EXISTS campusbite
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE campusbite;


-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) DEFAULT 'Lunch',
    weekday VARCHAR(20),
    dietary VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    total_price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id)
        ON DELETE SET NULL
);


-- Sample menu data
INSERT INTO menu_items
(name, description, price, category, weekday, dietary)
SELECT
    'Chicken Burger',
    'Grilled chicken burger with salad',
    7.90,
    'Lunch',
    'Monday',
    'halal'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items
    WHERE name = 'Chicken Burger'
);

INSERT INTO menu_items
(name, description, price, category, weekday, dietary)
SELECT
    'Beef Burger',
    'Beef burger with cheese and salad',
    8.90,
    'Lunch',
    'Wednesday',
    'halal'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items
    WHERE name = 'Beef Burger'
);

INSERT INTO menu_items
(name, description, price, category, weekday, dietary)
SELECT
    'Vegetable Pasta',
    'Pasta with vegetables and tomato sauce',
    6.90,
    'Lunch',
    'Friday',
    'vegetarian'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items
    WHERE name = 'Vegetable Pasta'
);