import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  readonly location?: string;

  @IsOptional()
  @IsDateString()
  readonly startDatetime?: string;

  @IsOptional()
  @IsDateString()
  readonly endDatetime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  readonly certificateAvailable?: boolean;
}
