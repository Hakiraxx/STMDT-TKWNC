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
