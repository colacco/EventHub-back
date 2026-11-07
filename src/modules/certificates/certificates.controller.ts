import { Controller, Get, Inject, Param, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CertificatesService } from './certificates.service';
import { CERTIFICATES_SERVICE } from './certificates.tokens';

@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(
    @Inject(CERTIFICATES_SERVICE)
    private readonly certificatesService: CertificatesService,
  ) {}

  @Get('registration/:registrationId')
  async downloadByRegistration(
    @Param('registrationId') registrationId: string,
    @Request() req: { user: JwtPayload },
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.certificatesService.generateCertificateByRegistration(registrationId, req.user.sub);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${registrationId}.pdf"`);
    res.send(buffer);
  }

  @Get(':token')
  async download(
    @Param('token') token: string,
    @Request() req: { user: JwtPayload },
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.certificatesService.generateCertificate(token, req.user.sub);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${token}.pdf"`);
    res.send(buffer);
  }
}
