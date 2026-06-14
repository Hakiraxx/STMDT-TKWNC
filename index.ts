import 'reflect-metadata';
import * as express from 'express';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { Product } from './src/product/product.entity';
import { Category } from './src/category/category.entity';
import { User } from './src/user/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TypeORM DataSource Connection
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ecommerce_db',
  entities: [Product, Category, User],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully via TypeORM in Express!');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

// ==========================================
// 1. CREATE - POST /products
// ==========================================
app.post('/products', async (req: Request, res: Response) => {
  const { name, slug, description, price, stock, imageUrl, categoryId, isActive } = req.body;

  if (!name || !slug || price === undefined) {
    return res.status(400).json({ message: 'Tên, slug và giá sản phẩm không được để trống' });
  }

  try {
    // Check if slug exists
    const existed = await productRepository.findOne({ where: { slug } });
    if (existed) {
      return res.status(409).json({ message: 'Slug sản phẩm đã tồn tại' });
    }

    // Create entity instance
    const product = productRepository.create({
      name,
      slug,
      description,
      price,
      stock: stock ?? 0,
      imageUrl,
      isActive: isActive ?? true,
      category: categoryId ? ({ id: categoryId } as any) : null,
    });

    // Save to Database
    const saved = await productRepository.save(product);
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error in POST /products:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm', error: error.message });
  }
});

// ==========================================
// 2. READ ALL - GET /products
// ==========================================
app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.find({
      relations: ['category'],
      order: { id: 'DESC' },
    });
    res.status(200).json(products);
  } catch (error: any) {
    console.error('Error in GET /products:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm', error: error.message });
  }
});

// ==========================================
// 3. READ DETAIL - GET /products/:id
// ==========================================
app.get('/products/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  try {
    const product = await productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      return res.status(404).json({ message: `Không tìm thấy sản phẩm với id = ${id}` });
    }

    res.status(200).json(product);
  } catch (error: any) {
    console.error('Error in GET /products/:id:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết sản phẩm', error: error.message });
  }
});

// ==========================================
// 4. UPDATE - PATCH /products/:id
// ==========================================
app.patch('/products/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  const { name, slug, description, price, stock, imageUrl, categoryId, isActive } = req.body;

  try {
    const product = await productRepository.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: `Không tìm thấy sản phẩm với id = ${id}` });
    }

    // Check slug duplicate if it has changed
    if (slug && slug !== product.slug) {
      const existed = await productRepository.findOne({ where: { slug } });
      if (existed) {
        return res.status(409).json({ message: 'Slug sản phẩm đã tồn tại' });
      }
    }

    // Merge changes
    const updatedProduct = productRepository.merge(product, {
      name,
      slug,
      description,
      price,
      stock,
      imageUrl,
      isActive,
      category: categoryId ? ({ id: categoryId } as any) : product.category,
    });

    const saved = await productRepository.save(updatedProduct);
    res.status(200).json(saved);
  } catch (error: any) {
    console.error('Error in PATCH /products/:id:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm', error: error.message });
  }
});

// ==========================================
// 5. DELETE - DELETE /products/:id
// ==========================================
app.delete('/products/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  try {
    const product = await productRepository.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: `Không tìm thấy sản phẩm với id = ${id}` });
    }

    await productRepository.remove(product);
    res.status(200).json({ message: `Đã xóa sản phẩm có id = ${id}` });
  } catch (error: any) {
    console.error('Error in DELETE /products/:id:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm', error: error.message });
  }
});

// ==========================================
// USER CRUD API ROUTES
// ==========================================

// 1. CREATE USER - POST /users
app.post('/users', async (req: Request, res: Response) => {
  const { username, password, email, fullName, role, isActive } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, mật khẩu và email không được để trống' });
  }

  try {
    // Check username exists
    const existedUsername = await userRepository.findOne({ where: { username } });
    if (existedUsername) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Check email exists
    const existedEmail = await userRepository.findOne({ where: { email } });
    if (existedEmail) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    const user = userRepository.create({
      username,
      password,
      email,
      fullName,
      role: role ?? 'CUSTOMER',
      isActive: isActive ?? true,
    });

    const saved = await userRepository.save(user);
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error in POST /users:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo người dùng', error: error.message });
  }
});

// 2. READ ALL USERS - GET /users
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      order: { id: 'DESC' },
    });
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error in GET /users:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng', error: error.message });
  }
});

// 3. READ USER DETAIL - GET /users/:id
app.get('/users/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  try {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: `Không tìm thấy người dùng với id = ${id}` });
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error in GET /users/:id:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết người dùng', error: error.message });
  }
});

// 4. UPDATE USER - PATCH /users/:id
app.patch('/users/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  const { username, password, email, fullName, role, isActive } = req.body;

  try {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: `Không tìm thấy người dùng với id = ${id}` });
    }

    // Check unique username
    if (username && username !== user.username) {
      const existed = await userRepository.findOne({ where: { username } });
      if (existed) {
        return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
      }
    }

    // Check unique email
    if (email && email !== user.email) {
      const existed = await userRepository.findOne({ where: { email } });
      if (existed) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }
    }

    const updatedUser = userRepository.merge(user, {
      username,
      password,
      email,
      fullName,
      role,
      isActive,
    });

    const saved = await userRepository.save(updatedUser);
    res.status(200).json(saved);
  } catch (error: any) {
    console.error('Error in PATCH /users/:id:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật người dùng', error: error.message });
  }
});

// 5. DELETE USER - DELETE /users/:id
app.delete('/users/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  try {
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: `Không tìm thấy người dùng với id = ${id}` });
    }

    await userRepository.remove(user);
    res.status(200).json({ message: `Đã xóa người dùng có id = ${id}` });
  } catch (error: any) {
    console.error('Error in DELETE /users/:id:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa người dùng', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express TypeORM server running on: http://localhost:${PORT}`);
});
