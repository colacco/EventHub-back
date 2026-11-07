export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class UserEntity {
  readonly id_user: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly created_at: Date;
  readonly updated_at: Date;
}
