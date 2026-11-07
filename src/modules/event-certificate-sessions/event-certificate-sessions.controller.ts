import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateEventCertificateSessionDto } from './dto/create-event-certificate-session.dto';
import { EventCertificateSessionEntity } from './entities/event-certificate-session.entity';
import { EventCertificateSessionsService } from './event-certificate-sessions.service';
import { EVENT_CERTIFICATE_SESSIONS_SERVICE } from './event-certificate-sessions.tokens';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('event-certificate-sessions')
export class EventCertificateSessionsController {
  constructor(
    @Inject(EVENT_CERTIFICATE_SESSIONS_SERVICE)
    private readonly sessionsService: EventCertificateSessionsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateEventCertificateSessionDto): Promise<EventCertificateSessionEntity> {
    return this.sessionsService.create(dto);
  }

  @Get('event/:eventId')
  async findByEvent(@Param('eventId') eventId: string): Promise<EventCertificateSessionEntity[]> {
    return this.sessionsService.findByEvent(eventId);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string): Promise<EventCertificateSessionEntity> {
    return this.sessionsService.activate(id);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<EventCertificateSessionEntity> {
    return this.sessionsService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.sessionsService.remove(id);
  }
}
