-- CreateTable
CREATE TABLE "event_certificate_sessions" (
    "id_certificate" TEXT NOT NULL,
    "id_event" TEXT NOT NULL,
    "release_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "activated_at" TIMESTAMP(3),

    CONSTRAINT "event_certificate_sessions_pkey" PRIMARY KEY ("id_certificate")
);

-- AddForeignKey
ALTER TABLE "event_certificate_sessions" ADD CONSTRAINT "event_certificate_sessions_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "events"("id_event") ON DELETE RESTRICT ON UPDATE CASCADE;
