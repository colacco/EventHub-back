import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EVENTS_REPOSITORY } from './interfaces/events-repository.interface';
import type { IEventsRepository } from './interfaces/events-repository.interface';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENTS_REPOSITORY)
    private readonly eventsRepository: IEventsRepository,
  ) {}

  async findAll(): Promise<EventEntity[]> {
    return this.eventsRepository.findAll();
  }

  async findById(id: string): Promise<EventEntity> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException(`Evento com id ${id} não encontrado.`);
    return event;
  }

  async create(dto: CreateEventDto, createdBy: string): Promise<EventEntity> {
    return this.eventsRepository.create(dto, createdBy);
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventEntity> {
    await this.findById(id);
    return this.eventsRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    return this.eventsRepository.delete(id);
  }
}
