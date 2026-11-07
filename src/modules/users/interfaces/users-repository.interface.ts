import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UserWithPassword extends UserEntity {
  readonly password_hash: string;
}

export interface IUsersRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findAll(): Promise<UserEntity[]>;
  create(dto: CreateUserDto): Promise<UserEntity>;
  update(id: string, dto: UpdateUserDto): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
