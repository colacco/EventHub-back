import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { EVENT_CERTIFICATE_SESSIONS_REPOSITORY } from '../event-certificate-sessions/interfaces/event-certificate-sessions-repository.interface';
import type { IEventCertificateSessionsRepository } from '../event-certificate-sessions/interfaces/event-certificate-sessions-repository.interface';
import { EVENTS_REPOSITORY } from '../events/interfaces/events-repository.interface';
import type { IEventsRepository } from '../events/interfaces/events-repository.interface';
import { REGISTRATIONS_REPOSITORY } from '../registrations/interfaces/registrations-repository.interface';
import type { IRegistrationsRepository } from '../registrations/interfaces/registrations-repository.interface';
import { RegistrationStatus } from '../registrations/entities/registration.entity';
import { USERS_REPOSITORY } from '../users/interfaces/users-repository.interface';
import type { IUsersRepository } from '../users/interfaces/users-repository.interface';

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(EVENT_CERTIFICATE_SESSIONS_REPOSITORY)
    private readonly sessionsRepository: IEventCertificateSessionsRepository,
    @Inject(REGISTRATIONS_REPOSITORY)
    private readonly registrationsRepository: IRegistrationsRepository,
    @Inject(EVENTS_REPOSITORY)
    private readonly eventsRepository: IEventsRepository,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async generateCertificate(token: string, userId: string): Promise<Buffer> {
    const session = await this.sessionsRepository.findActiveByToken(token);
    if (!session) throw new NotFoundException('Token de certificado inválido ou inativo.');

    const registration = await this.registrationsRepository.findByUserAndEvent(userId, session.id_event);
    if (!registration) throw new ForbiddenException('Você não possui inscrição neste evento.');
    if (registration.status !== RegistrationStatus.CONFIRMADO) {
      throw new BadRequestException('Certificado disponível apenas para participantes com check-in confirmado.');
    }
    if (!registration.certificate_release) {
      throw new BadRequestException('Certificado ainda não foi liberado para esta inscrição.');
    }

    const event = await this.eventsRepository.findById(session.id_event);
    if (!event) throw new NotFoundException('Evento não encontrado.');

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.buildPdf(user.name, event.title, event.start_datetime, event.end_datetime);
  }

  async generateCertificateByRegistration(registrationId: string, userId: string): Promise<Buffer> {
    const registration = await this.registrationsRepository.findById(registrationId);
    if (!registration) throw new NotFoundException('Inscrição não encontrada.');
    if (registration.id_user !== userId) throw new ForbiddenException('Acesso negado.');
    if (registration.status !== RegistrationStatus.CONFIRMADO) {
      throw new BadRequestException('Certificado disponível apenas para participantes com check-in confirmado.');
    }
    if (!registration.certificate_release) {
      throw new BadRequestException('Certificado ainda não foi liberado para esta inscrição.');
    }

    const event = await this.eventsRepository.findById(registration.id_event);
    if (!event) throw new NotFoundException('Evento não encontrado.');

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.buildPdf(user.name, event.title, event.start_datetime, event.end_datetime);
  }

  private buildPdf(
    participantName: string,
    eventTitle: string,
    startDatetime: Date | null,
    endDatetime: Date | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const centerX = pageWidth / 2;

      doc
        .rect(30, 30, pageWidth - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#2c3e50');

      doc.moveDown(2);

      doc
        .fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#2c3e50')
        .text('CERTIFICADO DE PARTICIPAÇÃO', { align: 'center' });

      doc.moveDown(1.5);

      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#555555')
        .text('Certificamos que', { align: 'center' });

      doc.moveDown(0.8);

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1a252f')
        .text(participantName, { align: 'center', underline: true });

      doc.moveDown(0.8);

      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#555555')
        .text('participou do evento', { align: 'center' });

      doc.moveDown(0.8);

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#2c3e50')
        .text(eventTitle, { align: 'center' });

      if (startDatetime || endDatetime) {
        doc.moveDown(0.8);
        const dateStr = this.formatDateRange(startDatetime, endDatetime);
        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor('#777777')
          .text(dateStr, { align: 'center' });
      }

      doc.moveDown(3);

      const lineY = doc.y;
      doc
        .moveTo(centerX - 120, lineY)
        .lineTo(centerX + 120, lineY)
        .lineWidth(1)
        .stroke('#aaaaaa');

      doc.moveDown(0.4);
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#999999')
        .text('Assinatura da Organização', { align: 'center' });

      doc.end();
    });
  }

  private formatDateRange(start: Date | null, end: Date | null): string {
    const fmt = (d: Date) =>
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    if (start && end) return `${fmt(start)} a ${fmt(end)}`;
    if (start) return fmt(start);
    if (end) return fmt(end);
    return '';
  }
}
