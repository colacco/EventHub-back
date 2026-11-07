export class EventEntity {
  readonly id_event: string;
  readonly title: string;
  readonly description: string | null;
  readonly location: string | null;
  readonly start_datetime: Date | null;
  readonly end_datetime: Date | null;
  readonly max_participants: number | null;
  readonly certificate_available: boolean;
  readonly created_by: string;
  readonly created_at: Date;
}
