import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENTS_REPOSITORY } from '../events/interfaces/events-repository.interface';
import type { IEventsRepository } from '../events/interfaces/events-repository.interface';
import { CreateEventCertificateSessionDto } from './dto/create-event-certificate-session.dto';
import { EventCertificateSessionEntity } from './entities/event-certificate-session.entity';
import { EVENT_CERTIFICATE_SESSIONS_REPOSITORY } from './interfaces/event-certificate-sessions-repository.interface';
import type { IEventCertificateSessionsRepository } from './interfaces/event-certificate-sessions-repository.interface';

@Injectable()
export class EventCertificateSessionsService {
  constructor(
    @Inject(EVENT_CERTIFICATE_SESSIONS_REPOSITORY)
    private readonly sessionsRepository: IEventCertificateSessionsRepository,
    @Inject(EVENTS_REPOSITORY)
    private readonly eventsRepository: IEventsRepository,
  ) {}

  async findByEvent(eventId: string): Promise<EventCertificateSessionEntity[]> {
    return this.sessionsRepository.findByEvent(eventId);
  }

  async create(dto: CreateEventCertificateSessionDto): Promise<EventCertificateSessionEntity> {
    const event = await this.eventsRepository.findById(dto.eventId);
    if (!event) throw new NotFoundException(`Evento com id ${dto.eventId} não encontrado.`);
    const releaseToken = crypto.randomUUID();
    return this.sessionsRepository.create(dto.eventId, releaseToken);
  }

  async activate(id: string): Promise<EventCertificateSessionEntity> {
    await this.findOneOrFail(id);
    return this.sessionsRepository.activate(id);
  }

  async deactivate(id: string): Promise<EventCertificateSessionEntity> {
    await this.findOneOrFail(id);
    return this.sessionsRepository.deactivate(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrFail(id);
    return this.sessionsRepository.delete(id);
  }

  private async findOneOrFail(id: string): Promise<EventCertificateSessionEntity> {
    const session = await this.sessionsRepository.findById(id);
    if (!session) throw new NotFoundException(`Sessão de certificado com id ${id} não encontrada.`);
    return session;
  }
}
