import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { USERS_SERVICE } from './users.tokens';

@Module({
  controllers: [UsersController],
  providers: [
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
    { provide: USERS_SERVICE, useClass: UsersService },
  ],
  exports: [USERS_REPOSITORY, USERS_SERVICE],
})
export class UsersModule {}
