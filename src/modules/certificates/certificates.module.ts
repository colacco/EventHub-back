import { Module } from '@nestjs/common';
import { EventCertificateSessionsModule } from '../event-certificate-sessions/event-certificate-sessions.module';
import { EventsModule } from '../events/events.module';
import { RegistrationsModule } from '../registrations/registrations.module';
import { UsersModule } from '../users/users.module';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { CERTIFICATES_SERVICE } from './certificates.tokens';

@Module({
  imports: [EventCertificateSessionsModule, RegistrationsModule, EventsModule, UsersModule],
  controllers: [CertificatesController],
  providers: [{ provide: CERTIFICATES_SERVICE, useClass: CertificatesService }],
})
export class CertificatesModule {}
