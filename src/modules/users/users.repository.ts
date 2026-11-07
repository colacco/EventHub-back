import { Injectable } from '@nestjs/common';
import { Prisma, User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, UserEntity } from './entities/user.entity';
import { IUsersRepository, UserWithPassword } from './interfaces/users-repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id_user: id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...this.toEntity(user), password_hash: user.password_hash };
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toEntity(u));
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash,
        role: dto.role ?? 'USER',
      },
    });
    return this.toEntity(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password !== undefined) {
      data.password_hash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({ where: { id_user: id }, data });
    return this.toEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id_user: id } });
  }

  private toEntity(raw: PrismaUser): UserEntity {
    return {
      id_user: raw.id_user,
      name: raw.name,
      email: raw.email,
      role: raw.role as Role,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    };
  }
}
