import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventEntity } from '../entities/event.entity';

export const EVENTS_REPOSITORY = 'EVENTS_REPOSITORY';

export interface IEventsRepository {
  findAll(): Promise<EventEntity[]>;
  findById(id: string): Promise<EventEntity | null>;
  create(dto: CreateEventDto, createdBy: string): Promise<EventEntity>;
  update(id: string, dto: UpdateEventDto): Promise<EventEntity>;
  delete(id: string): Promise<void>;
}
