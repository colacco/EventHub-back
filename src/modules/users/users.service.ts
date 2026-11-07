import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';
import type { IUsersRepository } from './interfaces/users-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
    return user;
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('E-mail já cadastrado.');
    return this.usersRepository.create(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    await this.findById(id);

    if (dto.email !== undefined) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing && existing.id_user !== id) {
        throw new ConflictException('E-mail já em uso por outro usuário.');
      }
    }

    return this.usersRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    return this.usersRepository.delete(id);
  }
}
