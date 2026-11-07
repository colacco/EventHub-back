-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('INSCRITO', 'CANCELADO', 'CONFIRMADO');

-- CreateTable
CREATE TABLE "registrations" (
    "id_registration" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_event" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'INSCRITO',
    "checkin_at" TIMESTAMP(3),
    "certificate_release" BOOLEAN NOT NULL DEFAULT false,
    "certificate_issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id_registration")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_id_user_id_event_key" ON "registrations"("id_user", "id_event");

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "events"("id_event") ON DELETE RESTRICT ON UPDATE CASCADE;
