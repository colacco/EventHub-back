import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { EVENTS_REPOSITORY } from '../events/interfaces/events-repository.interface';
import type { IEventsRepository } from '../events/interfaces/events-repository.interface';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationEntity, RegistrationStatus } from './entities/registration.entity';
import { REGISTRATIONS_REPOSITORY } from './interfaces/registrations-repository.interface';
import type { IRegistrationsRepository } from './interfaces/registrations-repository.interface';

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(REGISTRATIONS_REPOSITORY)
    private readonly registrationsRepository: IRegistrationsRepository,
    @Inject(EVENTS_REPOSITORY)
    private readonly eventsRepository: IEventsRepository,
  ) {}

  async findByUser(userId: string): Promise<RegistrationEntity[]> {
    return this.registrationsRepository.findByUser(userId);
  }

  async findByEvent(eventId: string): Promise<RegistrationEntity[]> {
    return this.registrationsRepository.findByEvent(eventId);
  }

  async register(userId: string, dto: CreateRegistrationDto): Promise<RegistrationEntity> {
    const event = await this.eventsRepository.findById(dto.eventId);
    if (!event) throw new NotFoundException(`Evento com id ${dto.eventId} não encontrado.`);

    const existing = await this.registrationsRepository.findByUserAndEvent(userId, dto.eventId);
    if (existing) throw new ConflictException('Usuário já inscrito neste evento.');

    if (event.max_participants !== null) {
      const count = await this.registrationsRepository.countByEvent(dto.eventId);
      if (count >= event.max_participants) {
        throw new BadRequestException('Capacidade máxima do evento atingida.');
      }
    }

    return this.registrationsRepository.create(userId, dto.eventId);
  }

  async checkin(id: string, userId: string, isAdmin = false): Promise<RegistrationEntity> {
    const registration = await this.findOneOrFail(id);
    if (!isAdmin && registration.id_user !== userId) throw new ForbiddenException('Acesso negado.');
    if (registration.status === RegistrationStatus.CANCELADO) {
      throw new BadRequestException('Inscrição cancelada não pode efetuar check-in.');
    }
    if (registration.status === RegistrationStatus.CONFIRMADO) {
      throw new BadRequestException('Check-in já realizado.');
    }

    const now = new Date();

    const event = await this.eventsRepository.findById(registration.id_event);
    const releaseCertificate = event?.certificate_available ?? false;

    return this.registrationsRepository.update(id, {
      status: RegistrationStatus.CONFIRMADO,
      checkin_at: now,
      ...(releaseCertificate ? { certificate_release: true, certificate_issued_at: now } : {}),
    });
  }

  async cancel(id: string, userId: string): Promise<RegistrationEntity> {
    const registration = await this.findOneOrFail(id);
    if (registration.id_user !== userId) throw new ForbiddenException('Acesso negado.');
    if (registration.status === RegistrationStatus.CANCELADO) {
      throw new BadRequestException('Inscrição já está cancelada.');
    }
    return this.registrationsRepository.update(id, { status: RegistrationStatus.CANCELADO });
  }

  async releaseCertificate(id: string): Promise<RegistrationEntity> {
    const registration = await this.findOneOrFail(id);
    if (registration.status !== RegistrationStatus.CONFIRMADO) {
      throw new BadRequestException('Certificado só pode ser emitido para participantes confirmados.');
    }
    return this.registrationsRepository.update(id, {
      certificate_release: true,
      certificate_issued_at: new Date(),
    });
  }

  async generateQrCode(id: string, userId: string, isAdmin = false): Promise<Buffer> {
    const registration = await this.findOneOrFail(id);
    if (!isAdmin && registration.id_user !== userId) throw new ForbiddenException('Acesso negado.');
    return QRCode.toBuffer(id, { type: 'png', width: 300 });
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrFail(id);
    return this.registrationsRepository.delete(id);
  }

  async findById(id: string): Promise<RegistrationEntity> {
    return this.findOneOrFail(id);
  }

  private async findOneOrFail(id: string): Promise<RegistrationEntity> {
    const registration = await this.registrationsRepository.findById(id);
    if (!registration) throw new NotFoundException(`Inscrição com id ${id} não encontrada.`);
    return registration;
  }
}
