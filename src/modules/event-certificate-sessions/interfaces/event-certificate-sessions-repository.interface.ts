import { EventCertificateSessionEntity } from '../entities/event-certificate-session.entity';

export const EVENT_CERTIFICATE_SESSIONS_REPOSITORY = 'EVENT_CERTIFICATE_SESSIONS_REPOSITORY';

export interface IEventCertificateSessionsRepository {
  findAll(): Promise<EventCertificateSessionEntity[]>;
  findById(id: string): Promise<EventCertificateSessionEntity | null>;
  findByEvent(eventId: string): Promise<EventCertificateSessionEntity[]>;
  findActiveByToken(token: string): Promise<EventCertificateSessionEntity | null>;
  create(eventId: string, releaseToken: string): Promise<EventCertificateSessionEntity>;
  activate(id: string): Promise<EventCertificateSessionEntity>;
  deactivate(id: string): Promise<EventCertificateSessionEntity>;
  delete(id: string): Promise<void>;
}
