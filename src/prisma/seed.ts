import { PrismaClient, RegistrationStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.eventCertificateSession.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('senha123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@eventos.com',
      password_hash: passwordHash,
      role: Role.ADMIN,
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Souza',
      email: 'alice@example.com',
      password_hash: passwordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Oliveira',
      email: 'bob@example.com',
      password_hash: passwordHash,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: 'Carol Lima',
      email: 'carol@example.com',
      password_hash: passwordHash,
    },
  });

  console.log(
    '✔ Usuários criados:',
    admin.email,
    alice.email,
    bob.email,
    carol.email,
  );

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86_400_000);

  const workshopJS = await prisma.event.create({
    data: {
      title: 'Workshop de JavaScript Moderno',
      description:
        'Conceitos avançados de JS: async/await, ESModules e performance.',
      location: 'Sala 101 — Bloco A',
      start_datetime: days(7),
      end_datetime: days(7),
      max_participants: 30,
      certificate_available: true,
      created_by: admin.id_user,
    },
  });

  const seminarIA = await prisma.event.create({
    data: {
      title: 'Seminário de Inteligência Artificial',
      description: 'Tendências, casos de uso e ética na IA aplicada.',
      location: 'Auditório Principal',
      start_datetime: days(14),
      end_datetime: days(15),
      max_participants: 100,
      certificate_available: true,
      created_by: admin.id_user,
    },
  });

  const hackathon = await prisma.event.create({
    data: {
      title: 'Hackathon Open Source',
      description: 'Maratona de programação colaborativa com projetos reais.',
      location: 'Laboratório de Inovação',
      start_datetime: days(30),
      end_datetime: days(31),
      max_participants: null,
      certificate_available: false,
      created_by: admin.id_user,
    },
  });

  console.log(
    '✔ Eventos criados:',
    workshopJS.title,
    seminarIA.title,
    hackathon.title,
  );

  const regAliceWorkshop = await prisma.registration.create({
    data: {
      id_user: alice.id_user,
      id_event: workshopJS.id_event,
      status: RegistrationStatus.CONFIRMADO,
      checkin_at: new Date(),
      certificate_release: true,
      certificate_issued_at: new Date(),
    },
  });

  const regBobWorkshop = await prisma.registration.create({
    data: {
      id_user: bob.id_user,
      id_event: workshopJS.id_event,
      status: RegistrationStatus.INSCRITO,
    },
  });

  const regCarolWorkshop = await prisma.registration.create({
    data: {
      id_user: carol.id_user,
      id_event: workshopJS.id_event,
      status: RegistrationStatus.CANCELADO,
    },
  });

  const regAliceSeminar = await prisma.registration.create({
    data: {
      id_user: alice.id_user,
      id_event: seminarIA.id_event,
      status: RegistrationStatus.INSCRITO,
    },
  });

  await prisma.registration.create({
    data: {
      id_user: bob.id_user,
      id_event: hackathon.id_event,
      status: RegistrationStatus.INSCRITO,
    },
  });

  await prisma.registration.create({
    data: {
      id_user: carol.id_user,
      id_event: seminarIA.id_event,
      status: RegistrationStatus.INSCRITO,
    },
  });

  console.log('✔ Inscrições criadas:', 6);

  const sessionWorkshop = await prisma.eventCertificateSession.create({
    data: {
      id_event: workshopJS.id_event,
      release_token: 'token-workshop-2025',
      is_active: true,
      activated_at: new Date(),
    },
  });

  const sessionSeminar = await prisma.eventCertificateSession.create({
    data: {
      id_event: seminarIA.id_event,
      release_token: 'token-seminario-2025',
      is_active: false,
    },
  });

  console.log(
    '✔ Sessões de certificado criadas:',
    sessionWorkshop.release_token,
    sessionSeminar.release_token,
  );

  console.log('\n── Seed concluído ──────────────────────────────────────────');
  console.log('Admin    :', admin.email, '  senha: senha123');
  console.log('Alice    :', alice.email, '  senha: senha123');
  console.log('Bob      :', bob.email, '    senha: senha123');
  console.log('Carol    :', carol.email, '  senha: senha123');
  console.log(
    '\nToken de certificado ativo (workshop):',
    sessionWorkshop.release_token,
  );
  console.log('  → GET /certificates/token-workshop-2025  (como Alice)');
  console.log('────────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
