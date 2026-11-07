import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEventCertificateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  readonly eventId: string;
}
