# BÁO CÁO THỰC HÀNH BÀI TẬP LỚN
## HỌC PHẦN: PHÁT TRIỂN HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ
### PHẦN BÀI LÀM CỦA THÀNH VIÊN: SINH VIÊN A - ĐỐI TƯỢNG: SẢN PHẨM (PRODUCT)

---

## 1. Link Github Repo công việc
- Github Repository chính: [https://github.com/Hakiraxx/STMDT-TKWNC](https://github.com/Hakiraxx/STMDT-TKWNC)
- Thư mục quản lý Sản phẩm (Product): [https://github.com/Hakiraxx/STMDT-TKWNC/tree/main/src/product](https://github.com/Hakiraxx/STMDT-TKWNC/tree/main/src/product)

---

## 2. Cấu trúc thư mục

```
├── src/
│   ├── category/
│   │   └── category.entity.ts
│   ├── product/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── product.entity.ts
│   │   ├── product.service.ts
│   │   ├── product.controller.ts
│   │   └── product.module.ts
│   ├── app.module.ts
│   └── main.ts
├── database/
│   └── ecommerce_db.sql
├── .env
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

---

## 3. Hướng dẫn cài đặt và chạy ứng dụng

### Bước 1: Cài đặt các thư viện (Dependencies)
```bash
npm install
```

### Bước 2: Khởi tạo Cơ sở dữ liệu
Chạy script SQL trong file `database/ecommerce_db.sql` để tạo CSDL và bảng dữ liệu mẫu:
```bash
mysql -u root -p < database/ecommerce_db.sql
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env` từ file `.env.example` và điều chỉnh cấu hình kết nối MySQL của bạn (nếu cần thiết):
```bash
cp .env.example .env
```
Nội dung file `.env` mẫu:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=ecommerce_db
```

### Bước 4: Chạy ứng dụng
- Chạy ở chế độ phát triển (Development):
  ```bash
  npm run start:dev
  ```
- Build sản phẩm:
  ```bash
  npm run build
  ```
- Chạy ở chế độ production:
  ```bash
  npm run start:prod
  ```

---

## 4. Mã nguồn các file yêu cầu (CRUD Product)

### 4.1. Entity Product (`src/product/product.entity.ts`)
```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 4.2. DTO Create & Update Product
- **CreateProductDto** (`src/product/dto/create-product.dto.ts`):
```typescript
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Slug không được để trống' })
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber()
  @Min(0, { message: 'Giá sản phẩm phải >= 0' })
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Số lượng tồn phải >= 0' })
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

- **UpdateProductDto** (`src/product/dto/update-product.dto.ts`):
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### 4.3. Controller Product (`src/product/product.controller.ts`)
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // POST /products - Tạo sản phẩm mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  // GET /products - Lấy danh sách sản phẩm
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // GET /products/:id - Lấy chi tiết 1 sản phẩm
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  // PATCH /products/:id - Cập nhật sản phẩm
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  // DELETE /products/:id - Xóa sản phẩm
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
```

### 4.4. Service Product (`src/product/product.service.ts`)
```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ---------------- CREATE ----------------
  async create(dto: CreateProductDto): Promise<Product> {
    const existed = await this.productRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existed) {
      throw new ConflictException('Slug sản phẩm đã tồn tại');
    }

    const product = this.productRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 0,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive ?? true,
      category: dto.categoryId ? ({ id: dto.categoryId } as any) : null,
    });

    return this.productRepository.save(product);
  }

  // ---------------- READ (list) ----------------
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category'],
      order: { id: 'DESC' },
    });
  }

  // ---------------- READ (detail) ----------------
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với id = ${id}`);
    }

    return product;
  }

  // ---------------- UPDATE ----------------
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.slug && dto.slug !== product.slug) {
      const existed = await this.productRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existed) {
        throw new ConflictException('Slug sản phẩm đã tồn tại');
      }
    }

    const updated = this.productRepository.merge(product, {
      ...dto,
      category: dto.categoryId ? ({ id: dto.categoryId } as any) : product.category,
    });

    return this.productRepository.save(updated);
  }

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Đã xóa sản phẩm có id = ${id}` };
  }
}
```

### 4.5. Module Product (`src/product/product.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
```

---

## 5. Lưu đồ thuật toán (Activity Diagram) của CRUD Product

### Sơ đồ trực quan từ file thiết kế:
![Lưu đồ thuật toán CRUD Product](https://i.ibb.co/qYKxfFd6/ktra-GKI-drawio.png)

