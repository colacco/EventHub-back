import { Injectable } from '@nestjs/common';
import { Registration as PrismaRegistration, RegistrationStatus as PrismaRegistrationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationEntity, RegistrationStatus } from './entities/registration.entity';
import { IRegistrationsRepository } from './interfaces/registrations-repository.interface';

@Injectable()
export class RegistrationsRepository implements IRegistrationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RegistrationEntity[]> {
    const rows = await this.prisma.registration.findMany({ orderBy: { created_at: 'desc' } });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<RegistrationEntity | null> {
    const row = await this.prisma.registration.findUnique({ where: { id_registration: id } });
    return row ? this.toEntity(row) : null;
  }

  async findByUser(userId: string): Promise<RegistrationEntity[]> {
    const rows = await this.prisma.registration.findMany({ where: { id_user: userId }, orderBy: { created_at: 'desc' } });
    return rows.map((r) => this.toEntity(r));
  }

  async findByEvent(eventId: string): Promise<RegistrationEntity[]> {
    const rows = await this.prisma.registration.findMany({
      where: { id_event: eventId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) => ({
      ...this.toEntity(r),
      user: { name: r.user.name, email: r.user.email },
    }));
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<RegistrationEntity | null> {
    const row = await this.prisma.registration.findUnique({
      where: { id_user_id_event: { id_user: userId, id_event: eventId } },
    });
    return row ? this.toEntity(row) : null;
  }

  async countByEvent(eventId: string): Promise<number> {
    return this.prisma.registration.count({ where: { id_event: eventId } });
  }

  async create(userId: string, eventId: string): Promise<RegistrationEntity> {
    const row = await this.prisma.registration.create({
      data: { id_user: userId, id_event: eventId },
    });
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<RegistrationEntity>): Promise<RegistrationEntity> {
    const prismaData: Partial<PrismaRegistration> = {};
    if (data.status !== undefined) prismaData.status = data.status as unknown as PrismaRegistrationStatus;
    if (data.checkin_at !== undefined) prismaData.checkin_at = data.checkin_at;
    if (data.certificate_release !== undefined) prismaData.certificate_release = data.certificate_release;
    if (data.certificate_issued_at !== undefined) prismaData.certificate_issued_at = data.certificate_issued_at;

    const row = await this.prisma.registration.update({ where: { id_registration: id }, data: prismaData });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.registration.delete({ where: { id_registration: id } });
  }

  private toEntity(raw: PrismaRegistration): RegistrationEntity {
    return {
      id_registration: raw.id_registration,
      id_user: raw.id_user,
      id_event: raw.id_event,
      status: raw.status as unknown as RegistrationStatus,
      checkin_at: raw.checkin_at,
      certificate_release: raw.certificate_release,
      certificate_issued_at: raw.certificate_issued_at,
      created_at: raw.created_at,
    };
  }
}
