-- =========================================================
-- CSDL: Ứng dụng Thương mại điện tử Đa mặt hàng (Ecommerce)
-- =========================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

-- ---------------------------------------------------------
-- 1. Bảng Category (Danh mục sản phẩm)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS category (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. Bảng Product (Sản phẩm) - Đối tượng chính của thành viên
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS product (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price       DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock       INT NOT NULL DEFAULT 0,
    image_url   VARCHAR(500),
    category_id INT,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES category(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ---------------------------------------------------------
-- 3. Bảng Customer (Khách hàng) - Đối tượng của thành viên khác
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    phone       VARCHAR(20),
    address     VARCHAR(255),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 4. Bảng Orders (Đơn hàng) - Đối tượng của thành viên khác
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
    status      ENUM('PENDING','CONFIRMED','SHIPPING','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customer(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------------------------------------------------------
-- 5. Bảng Order_Item (Chi tiết đơn hàng) - Đối tượng của thành viên khác
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_item (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_orderitem_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_orderitem_product
        FOREIGN KEY (product_id) REFERENCES product(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------------------------------------------------------
-- 6. Bảng User (Người dùng) - Thành viên mới bổ sung
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    full_name   VARCHAR(100),
    role        VARCHAR(20) DEFAULT 'CUSTOMER',
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- DỮ LIỆU MẪU
-- ---------------------------------------------------------
INSERT INTO category (name, slug, description) VALUES
('Điện thoại', 'dien-thoai', 'Các loại điện thoại di động'),
('Laptop', 'laptop', 'Máy tính xách tay'),
('Phụ kiện', 'phu-kien', 'Phụ kiện công nghệ');

INSERT INTO user (username, password, email, full_name, role) VALUES
('admin', 'admin123', 'admin@example.com', 'System Admin', 'ADMIN'),
('customer1', 'customer123', 'customer1@example.com', 'John Doe', 'CUSTOMER');


INSERT INTO product (name, slug, description, price, stock, image_url, category_id) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'Điện thoại Apple iPhone 15 Pro 256GB', 28990000, 50, 'https://example.com/img/iphone15pro.jpg', 1),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Điện thoại Samsung Galaxy S24 128GB', 19990000, 40, 'https://example.com/img/galaxys24.jpg', 1),
('MacBook Air M2', 'macbook-air-m2', 'Laptop Apple MacBook Air chip M2 8GB/256GB', 26990000, 20, 'https://example.com/img/macbookairm2.jpg', 2),
('Tai nghe AirPods Pro 2', 'airpods-pro-2', 'Tai nghe không dây chống ồn AirPods Pro 2', 5990000, 100, 'https://example.com/img/airpodspro2.jpg', 3);

INSERT INTO customer (full_name, email, phone, address) VALUES
('Nguyễn Văn A', 'nguyenvana@example.com', '0901234567', '123 Lê Lợi, Quận 1, TP.HCM'),
('Trần Thị B', 'tranthib@example.com', '0912345678', '45 Trần Hưng Đạo, Đà Nẵng');

INSERT INTO orders (customer_id, status, total_amount) VALUES
(1, 'CONFIRMED', 34980000),
(2, 'PENDING', 19990000);

INSERT INTO order_item (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 28990000),
(1, 4, 1, 5990000),
(2, 2, 1, 19990000);
