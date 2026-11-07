export enum RegistrationStatus {
  INSCRITO = 'INSCRITO',
  CANCELADO = 'CANCELADO',
  CONFIRMADO = 'CONFIRMADO',
}

export class RegistrationEntity {
  readonly id_registration: string;
  readonly id_user: string;
  readonly id_event: string;
  readonly status: RegistrationStatus;
  readonly checkin_at: Date | null;
  readonly certificate_release: boolean;
  readonly certificate_issued_at: Date | null;
  readonly created_at: Date;
  readonly user?: { name: string; email: string };
}
