import { Injectable } from '@nestjs/common';
import { EventCertificateSession as PrismaEventCertificateSession } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventCertificateSessionEntity } from './entities/event-certificate-session.entity';
import { IEventCertificateSessionsRepository } from './interfaces/event-certificate-sessions-repository.interface';

@Injectable()
export class EventCertificateSessionsRepository implements IEventCertificateSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EventCertificateSessionEntity[]> {
    const rows = await this.prisma.eventCertificateSession.findMany();
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<EventCertificateSessionEntity | null> {
    const row = await this.prisma.eventCertificateSession.findUnique({ where: { id_certificate: id } });
    return row ? this.toEntity(row) : null;
  }

  async findByEvent(eventId: string): Promise<EventCertificateSessionEntity[]> {
    const rows = await this.prisma.eventCertificateSession.findMany({ where: { id_event: eventId } });
    return rows.map((r) => this.toEntity(r));
  }

  async findActiveByToken(token: string): Promise<EventCertificateSessionEntity | null> {
    const row = await this.prisma.eventCertificateSession.findFirst({
      where: { release_token: token, is_active: true },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(eventId: string, releaseToken: string): Promise<EventCertificateSessionEntity> {
    const row = await this.prisma.eventCertificateSession.create({
      data: { id_event: eventId, release_token: releaseToken },
    });
    return this.toEntity(row);
  }

  async activate(id: string): Promise<EventCertificateSessionEntity> {
    const row = await this.prisma.eventCertificateSession.update({
      where: { id_certificate: id },
      data: { is_active: true, activated_at: new Date() },
    });
    return this.toEntity(row);
  }

  async deactivate(id: string): Promise<EventCertificateSessionEntity> {
    const row = await this.prisma.eventCertificateSession.update({
      where: { id_certificate: id },
      data: { is_active: false },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.eventCertificateSession.delete({ where: { id_certificate: id } });
  }

  private toEntity(raw: PrismaEventCertificateSession): EventCertificateSessionEntity {
    return {
      id_certificate: raw.id_certificate,
      id_event: raw.id_event,
      release_token: raw.release_token,
      is_active: raw.is_active,
      activated_at: raw.activated_at,
    };
  }
}
