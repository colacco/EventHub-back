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
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrationsService } from './registrations.service';
import { REGISTRATIONS_SERVICE } from './registrations.tokens';

@UseGuards(JwtAuthGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(
    @Inject(REGISTRATIONS_SERVICE)
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Post()
  async register(
    @Body() dto: CreateRegistrationDto,
    @Request() req: { user: JwtPayload },
  ): Promise<RegistrationEntity> {
    return this.registrationsService.register(req.user.sub, dto);
  }

  @Get('me')
  async findMine(@Request() req: { user: JwtPayload }): Promise<RegistrationEntity[]> {
    return this.registrationsService.findByUser(req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('event/:eventId')
  async findByEvent(@Param('eventId') eventId: string): Promise<RegistrationEntity[]> {
    return this.registrationsService.findByEvent(eventId);
  }

  @Get(':id/qrcode')
  async qrCode(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
    @Res() res: Response,
  ): Promise<void> {
    const isAdmin = req.user.role === 'ADMIN';
    const buffer = await this.registrationsService.generateQrCode(id, req.user.sub, isAdmin);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qrcode-${id}.png"`);
    res.send(buffer);
  }

  @Patch(':id/checkin')
  async checkin(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<RegistrationEntity> {
    const isAdmin = req.user.role === 'ADMIN';
    return this.registrationsService.checkin(id, req.user.sub, isAdmin);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<RegistrationEntity> {
    return this.registrationsService.cancel(id, req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/certificate')
  async releaseCertificate(@Param('id') id: string): Promise<RegistrationEntity> {
    return this.registrationsService.releaseCertificate(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.registrationsService.remove(id);
  }
}
