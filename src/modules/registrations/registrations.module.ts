import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { REGISTRATIONS_REPOSITORY } from './interfaces/registrations-repository.interface';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsRepository } from './registrations.repository';
import { RegistrationsService } from './registrations.service';
import { REGISTRATIONS_SERVICE } from './registrations.tokens';

@Module({
  imports: [EventsModule],
  controllers: [RegistrationsController],
  providers: [
    { provide: REGISTRATIONS_REPOSITORY, useClass: RegistrationsRepository },
    { provide: REGISTRATIONS_SERVICE, useClass: RegistrationsService },
  ],
  exports: [REGISTRATIONS_REPOSITORY, REGISTRATIONS_SERVICE],
})
export class RegistrationsModule {}
