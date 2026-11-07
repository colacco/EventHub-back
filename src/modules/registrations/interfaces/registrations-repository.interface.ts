import { RegistrationEntity } from '../entities/registration.entity';

export const REGISTRATIONS_REPOSITORY = 'REGISTRATIONS_REPOSITORY';

export interface IRegistrationsRepository {
  findAll(): Promise<RegistrationEntity[]>;
  findById(id: string): Promise<RegistrationEntity | null>;
  findByUser(userId: string): Promise<RegistrationEntity[]>;
  findByEvent(eventId: string): Promise<RegistrationEntity[]>;
  findByUserAndEvent(userId: string, eventId: string): Promise<RegistrationEntity | null>;
  countByEvent(eventId: string): Promise<number>;
  create(userId: string, eventId: string): Promise<RegistrationEntity>;
  update(id: string, data: Partial<RegistrationEntity>): Promise<RegistrationEntity>;
  delete(id: string): Promise<void>;
}
