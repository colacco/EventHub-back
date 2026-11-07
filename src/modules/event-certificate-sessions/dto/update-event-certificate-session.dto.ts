import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEventCertificateSessionDto {
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
