import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { EVENT_CERTIFICATE_SESSIONS_REPOSITORY } from './interfaces/event-certificate-sessions-repository.interface';
import { EventCertificateSessionsController } from './event-certificate-sessions.controller';
import { EventCertificateSessionsRepository } from './event-certificate-sessions.repository';
import { EventCertificateSessionsService } from './event-certificate-sessions.service';
import { EVENT_CERTIFICATE_SESSIONS_SERVICE } from './event-certificate-sessions.tokens';

@Module({
  imports: [EventsModule],
  controllers: [EventCertificateSessionsController],
  providers: [
    { provide: EVENT_CERTIFICATE_SESSIONS_REPOSITORY, useClass: EventCertificateSessionsRepository },
    { provide: EVENT_CERTIFICATE_SESSIONS_SERVICE, useClass: EventCertificateSessionsService },
  ],
  exports: [EVENT_CERTIFICATE_SESSIONS_REPOSITORY, EVENT_CERTIFICATE_SESSIONS_SERVICE],
})
export class EventCertificateSessionsModule {}
