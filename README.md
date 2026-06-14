# Đối tượng: Sản phẩm (Product)

Module quản lý Sản phẩm trong hệ thống Thương mại điện tử Đa mặt hàng.

## 1. Link Github Repo
> Thay bằng link repo thật của bạn, ví dụ:
> https://github.com/<ten-nhom>/ecommerce-multi-product/tree/main/src/product

## 2. Cấu trúc thư mục

```
src/
├── category/
│   └── category.entity.ts
└── product/
    ├── dto/
    │   ├── create-product.dto.ts
    │   └── update-product.dto.ts
    ├── product.entity.ts
    ├── product.service.ts
    ├── product.controller.ts
    └── product.module.ts
database/
└── ecommerce_db.sql
```

## 3. Database (CSDL)

File `database/ecommerce_db.sql` tạo CSDL `ecommerce_db` gồm các bảng:
category, product, customer, orders, order_item kèm dữ liệu mẫu.

Cách chạy:
```bash
mysql -u root -p < database/ecommerce_db.sql
```

## 4. Chức năng CRUD cho Product

| Chức năng | Method | Endpoint              | Mô tả                                  |
|-----------|--------|-----------------------|-----------------------------------------|
| Create    | POST   | `/products`           | Tạo mới sản phẩm                        |
| Read      | GET    | `/products`           | Lấy danh sách tất cả sản phẩm           |
| Read      | GET    | `/products/:id`       | Lấy chi tiết 1 sản phẩm theo id         |
| Update    | PATCH  | `/products/:id`       | Cập nhật thông tin sản phẩm             |
| Delete    | DELETE | `/products/:id`       | Xóa sản phẩm theo id                    |

### Ví dụ Create - body JSON
```json
{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "Điện thoại Apple iPhone 15 Pro 256GB",
  "price": 28990000,
  "stock": 50,
  "imageUrl": "https://example.com/img/iphone15pro.jpg",
  "categoryId": 1
}
```

### Ví dụ Update - body JSON (PATCH /products/1)
```json
{
  "price": 27990000,
  "stock": 45
}
```

## 5. Lưu đồ thuật toán (Activity Diagram)

Lưu đồ cho 4 chức năng CRUD được đính kèm dưới dạng hình ảnh trong thư mục
`docs/diagrams/`:
- `create-product.png`
- `read-product.png`
- `update-product.png`
- `delete-product.png`

## 6. Công nghệ sử dụng

- NestJS (Node.js framework)
- TypeORM
- MySQL / MariaDB
- class-validator (validate DTO)
