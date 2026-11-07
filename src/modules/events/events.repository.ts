import { Injectable } from '@nestjs/common';
import { Event as PrismaEvent } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { IEventsRepository } from './interfaces/events-repository.interface';

@Injectable()
export class EventsRepository implements IEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EventEntity[]> {
    const events = await this.prisma.event.findMany({ orderBy: { created_at: 'desc' } });
    return events.map((e) => this.toEntity(e));
  }

  async findById(id: string): Promise<EventEntity | null> {
    const event = await this.prisma.event.findUnique({ where: { id_event: id } });
    return event ? this.toEntity(event) : null;
  }

  async create(dto: CreateEventDto, createdBy: string): Promise<EventEntity> {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        location: dto.location ?? null,
        start_datetime: dto.startDatetime ? new Date(dto.startDatetime) : null,
        end_datetime: dto.endDatetime ? new Date(dto.endDatetime) : null,
        max_participants: dto.maxParticipants ?? null,
        certificate_available: dto.certificateAvailable ?? false,
        created_by: createdBy,
      },
    });
    return this.toEntity(event);
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventEntity> {
    const data: Partial<PrismaEvent> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.startDatetime !== undefined) data.start_datetime = new Date(dto.startDatetime);
    if (dto.endDatetime !== undefined) data.end_datetime = new Date(dto.endDatetime);
    if (dto.maxParticipants !== undefined) data.max_participants = dto.maxParticipants;
    if (dto.certificateAvailable !== undefined) data.certificate_available = dto.certificateAvailable;

    const event = await this.prisma.event.update({ where: { id_event: id }, data });
    return this.toEntity(event);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id_event: id } });
  }

  private toEntity(raw: PrismaEvent): EventEntity {
    return {
      id_event: raw.id_event,
      title: raw.title,
      description: raw.description,
      location: raw.location,
      start_datetime: raw.start_datetime,
      end_datetime: raw.end_datetime,
      max_participants: raw.max_participants,
      certificate_available: raw.certificate_available,
      created_by: raw.created_by,
      created_at: raw.created_at,
    };
  }
}
