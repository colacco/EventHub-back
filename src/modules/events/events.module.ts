import { Module } from '@nestjs/common';
import { EVENTS_REPOSITORY } from './interfaces/events-repository.interface';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { EVENTS_SERVICE } from './events.tokens';

@Module({
  controllers: [EventsController],
  providers: [
    { provide: EVENTS_REPOSITORY, useClass: EventsRepository },
    { provide: EVENTS_SERVICE, useClass: EventsService },
  ],
  exports: [EVENTS_REPOSITORY, EVENTS_SERVICE],
})
export class EventsModule {}
