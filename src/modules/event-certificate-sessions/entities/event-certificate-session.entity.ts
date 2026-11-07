export class EventCertificateSessionEntity {
  readonly id_certificate: string;
  readonly id_event: string;
  readonly release_token: string | null;
  readonly is_active: boolean;
  readonly activated_at: Date | null;
}
