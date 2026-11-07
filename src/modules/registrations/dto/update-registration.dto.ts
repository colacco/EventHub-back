import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { RegistrationStatus } from '../entities/registration.entity';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsEnum(RegistrationStatus)
  readonly status?: RegistrationStatus;

  @IsOptional()
  @IsBoolean()
  readonly certificateRelease?: boolean;
}
