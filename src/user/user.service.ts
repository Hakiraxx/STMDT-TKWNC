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

  // ---------------- CREATE ----------------
  async create(dto: CreateUserDto): Promise<User> {
    // Check if username already exists
    const existedUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existedUsername) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Check if email already exists
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

  // ---------------- READ (list) ----------------
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { id: 'DESC' },
    });
  }

  // ---------------- READ (detail) ----------------
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với id = ${id}`);
    }

    return user;
  }

  // ---------------- UPDATE ----------------
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check username unique if it's changing
    if (dto.username && dto.username !== user.username) {
      const existed = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existed) {
        throw new ConflictException('Tên đăng nhập đã tồn tại');
      }
    }

    // Check email unique if it's changing
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

  // ---------------- DELETE ----------------
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `Đã xóa người dùng có id = ${id}` };
  }
}
