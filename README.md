# BÁO CÁO THỰC HÀNH BÀI TẬP LỚN
## HỌC PHẦN: PHÁT TRIỂN HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ
### PHẦN BÀI LÀM CỦA THÀNH VIÊN: SINH VIÊN A - ĐỐI TƯỢNG: SẢN PHẨM (PRODUCT)
#Nguyen Tan Dung - 24100552
---

## 1. Link Github Repo công việc
- Github Repository chính: [https://github.com/Hakiraxx/STMDT-TKWNC](https://github.com/Hakiraxx/STMDT-TKWNC)
- Thư mục quản lý Sản phẩm (Product): [https://github.com/Hakiraxx/STMDT-TKWNC/tree/main/src/product](https://github.com/Hakiraxx/STMDT-TKWNC/tree/main/src/product)
- Thư mục quản lý Người dùng (User): [https://github.com/Hakiraxx/STMDT-TKWNC/tree/main/src/user](https://github.com/Hakiraxx/STMDT-TKWNC/tree/main/src/user)

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
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── user.entity.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   └── user.module.ts
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

- **Chạy ứng dụng bằng NestJS** (Chế độ phát triển):
  ```bash
  npm run start:dev
  ```
- **Chạy ứng dụng bằng Express độc lập** (`index.ts`):
  ```bash
  npm run start:express
  ```
- **Build sản phẩm (NestJS)**:
  ```bash
  npm run build
  ```
- **Chạy ở chế độ production (NestJS)**:
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

### 4.6. Entity User (`src/user/user.entity.ts`)
```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 20, default: 'CUSTOMER' })
  role: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 4.7. DTO Create & Update User
- **CreateUserDto** (`src/user/dto/create-user.dto.ts`):
```typescript
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  @MinLength(3, { message: 'Username phải chứa nhất 3 ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

- **UpdateUserDto** (`src/user/dto/update-user.dto.ts`):
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 4.8. Controller User (`src/user/user.controller.ts`)
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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
```

### 4.9. Service User (`src/user/user.service.ts`)
```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existedUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existedUsername) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const existedEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existedEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    const user = this.userRepository.create({
      username: dto.username,
      password: dto.password,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role ?? 'CUSTOMER',
      isActive: dto.isActive ?? true,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với id = ${id}`);
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.username && dto.username !== user.username) {
      const existed = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existed) {
        throw new ConflictException('Tên đăng nhập đã tồn tại');
      }
    }

    if (dto.email && dto.email !== user.email) {
      const existed = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existed) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    const updated = this.userRepository.merge(user, dto);
    return this.userRepository.save(updated);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `Đã xóa người dùng có id = ${id}` };
  }
}
```

### 4.10. Module User (`src/user/user.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

---

## 5. Lưu đồ thuật toán (Activity Diagram) của CRUD Product

### Sơ đồ trực quan từ file thiết kế:
![Lưu đồ thuật toán CRUD Product](https://i.ibb.co/qYKxfFd6/ktra-GKI-drawio.png)

---

## 6. Lưu đồ thuật toán (Activity Diagram) của CRUD User

### Sơ đồ tương ứng cho User CRUD:

```mermaid
flowchart TD
    Start([Bắt Đầu]) --> ReceiveReq[Nhận yêu cầu<br/>CREATE, READ, UPDATE, DELETE]
    ReceiveReq --> TypeDecision{Loại}

    %% CREATE BRANCH
    TypeDecision -- Create --> InputData[Nhập Dữ Liệu User<br/>username, password, email]
    InputData --> ValidateCreate{Dữ liệu hợp lệ &<br/>username/email chưa tồn tại}
    ValidateCreate -- False --> ErrorCreate[Trả về mã lỗi<br/>409 / 400]
    ValidateCreate -- True --> SaveCreate[Lưu User và CSDL]
    SaveCreate --> Return201[Trả về mã 201 Created]

    %% READ BRANCH
    TypeDecision -- READ --> QueryRead[Truy Vấn CSDL<br/>FindAll || findOne id]
    QueryRead --> FoundRead{Tìm Thấy ?}
    FoundRead -- True --> Return200[Trả về mã 200<br/>kèm thông tin người dùng]
    FoundRead -- False --> Error404Read[Trả về mã lỗi 404]

    %% UPDATE BRANCH
    TypeDecision -- Update --> FindUpdate[Tìm người dùng theo ID<br/>FindOne id]
    FindUpdate --> FoundUpdate{Tìm thấy}
    FoundUpdate -- False --> Error404Update[Trả lỗi 404]
    FoundUpdate -- True --> UsernameEmailChanged{Kiểm tra thay đổi<br/>username/email}
    UsernameEmailChanged -- False --> ExecUpdate[Cập nhật bản ghi<br/>Update user SET]
    UsernameEmailChanged -- True --> UserExistCheck{Kiểm tra username/email<br/>tồn tại chưa}
    UserExistCheck -- True --> DuplicateUser{Trùng}
    DuplicateUser -- True --> Error409Update[Báo mã lỗi 409]
    DuplicateUser -- False --> ExecUpdate

    %% DELETE BRANCH
    TypeDecision -- Delete --> FindDelete[Tìm người dùng theo ID<br/>FindOne id]
    FindDelete --> FoundDelete{Tìm thấy}
    FoundDelete -- False --> Error404Delete[Trả mã lỗi 404]
    FoundDelete -- True --> ExecDelete[Xóa bản ghi khỏi CSDL<br/>DELETE FROM user]

    %% CONVERGENCE TO NOTIFICATION
    ErrorCreate --> ShowNotification[Hiển Thị Thông Báo]
    Return201 --> ShowNotification
    Return200 --> ShowNotification
    Error404Read --> ShowNotification
    Error404Update --> ShowNotification
    ExecUpdate --> ShowNotification
    Error409Update --> ShowNotification
    Error404Delete --> ShowNotification
    ExecDelete --> ShowNotification
```

