<div align="center">
  <h1>EventHub — API</h1>

  <p>
    <strong>
      API REST para gestão de eventos acadêmicos: inscrições, check-in por QR Code e certificados em PDF.
    </strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  </p>
</div>

<br />

## Sobre o Projeto

**EventHub** é o back-end de um sistema de gerenciamento de eventos desenvolvido como projeto universitário. A API permite que administradores criem e gerenciem eventos, que participantes se inscrevam e façam check-in por QR Code e que certificados de participação sejam emitidos em PDF.

### Principais Funcionalidades

- **Autenticação e Papéis**: login com JWT e controle de acesso por papel (`ADMIN` / `USER`).
- **Gestão de Eventos**: CRUD completo de eventos com local, datas, limite de vagas e disponibilidade de certificado.
- **Inscrições com Controle de Vagas**: um usuário só pode se inscrever uma vez por evento, respeitando a capacidade máxima.
- **Check-in**: confirma a presença do participante e libera o certificado automaticamente quando o evento oferece certificado.
- **QR Code**: gera uma imagem PNG com o identificador da inscrição.
- **Sessões de Certificado**: o administrador cria tokens de liberação e os ativa ou desativa por evento.
- **Certificados em PDF**: gerados em tempo real (A4 paisagem) com o nome do participante, o evento e as datas.
- **Validação de Dados**: DTOs validados com `class-validator`, rejeitando campos não permitidos.
- **Seed de Desenvolvimento**: usuários, eventos, inscrições e tokens prontos para testar.

---

## Arquitetura

Arquitetura em camadas com inversão de dependência: cada módulo expõe um controller, um service e uma interface de repositório, cuja implementação concreta usa o Prisma.

```
HTTP  →  Controller  →  Service  →  IRepository (token de DI)  →  PrismaRepository  →  PostgreSQL
           (guards)     (regras)       (interface)                  (implementação)
```

- **Guards**: `JwtAuthGuard` valida o token Bearer, e `RolesGuard` com o decorator `@Roles('ADMIN')` restringe as rotas administrativas (`src/common/`).
- **Injeção por tokens**: services e repositórios são registrados com tokens (`*.tokens.ts`, `*_REPOSITORY`), o que desacopla as regras de negócio do Prisma.
- **Validação global**: `ValidationPipe` com `whitelist`, `forbidNonWhitelisted` e `transform` (`src/main.ts`).
- **Ciclo de vida da inscrição**:

```
INSCRITO ──check-in──▶ CONFIRMADO ──(certificado liberado)──▶ PDF disponível
    │
    └──cancelar──▶ CANCELADO
```

### Modelo de dados

| Tabela | O que armazena |
|---|---|
| `users` | Usuários (nome, e-mail único, hash da senha, papel `ADMIN`/`USER`) |
| `events` | Eventos (título, descrição, local, início/fim, máx. de participantes, se emite certificado, criador) |
| `registrations` | Inscrições usuário ↔ evento (status, data do check-in, liberação/emissão do certificado). Par `(usuário, evento)` único |
| `event_certificate_sessions` | Tokens de liberação de certificado por evento (ativo/inativo, data de ativação) |

### Estrutura de pastas

```
src/
├── common/
│   ├── decorators/        # @Roles
│   └── guards/            # JwtAuthGuard, RolesGuard
├── modules/
│   ├── auth/              # login + estratégia JWT
│   ├── users/
│   ├── events/
│   ├── registrations/     # inscrições, check-in, QR Code
│   ├── event-certificate-sessions/
│   └── certificates/      # geração de PDF
├── prisma/                # PrismaService + seed
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
└── migrations/
```

---

## Tecnologias Utilizadas

- **[NestJS](https://nestjs.com/)**: framework Node.js para a API.
- **[TypeScript](https://www.typescriptlang.org/)**: tipagem estática.
- **[Prisma](https://www.prisma.io/)**: ORM, migrations e seed.
- **[PostgreSQL](https://www.postgresql.org/)**: banco de dados relacional.
- **[Passport](https://www.passportjs.org/) + [JWT](https://jwt.io/)**: autenticação.
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)**: hash de senhas.
- **[class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer)**: validação de DTOs.
- **[PDFKit](https://pdfkit.org/)**: geração de certificados.
- **[qrcode](https://github.com/soldair/node-qrcode)**: geração de QR Codes.
- **[Docker Compose](https://docs.docker.com/compose/)**: banco de dados local.
- **[Vitest](https://vitest.dev/)**, **[ESLint](https://eslint.org/)** e **[Prettier](https://prettier.io/)**: testes, lint e formatação.

---

## Pré-requisitos

- Node.js 20+ e npm
- Docker (para o PostgreSQL)

## Configuração

### 1. Instalar as dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

```env
PORT=3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gerenciador_eventos"

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=gerenciador_eventos
DB_PORT=5433

JWT_SECRET="troque-por-um-segredo-aleatorio-e-longo"
JWT_EXPIRES_IN="7d"
```

> A porta `5433` evita conflito com um PostgreSQL nativo que já esteja rodando na `5432`. A porta da `DATABASE_URL` precisa ser a mesma de `DB_PORT`.

### 3. Subir o banco de dados

```bash
docker compose up -d
```

### 4. Aplicar as migrations e popular o banco

```bash
npx prisma migrate dev
npx prisma db seed
```

## Executando

```bash
npm run start:dev
```

A API fica disponível em `http://localhost:3000`.

| Script | Descrição |
|---|---|
| `npm run start:dev` | Modo desenvolvimento com hot reload |
| `npm run start:debug` | Modo debug com hot reload |
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Executa a versão compilada |
| `npm run lint` | ESLint com correção automática |
| `npm run format` | Formata com Prettier |
| `npm test` | Executa o Vitest |

### Usuários de teste (seed)

| E-mail | Papel | Senha |
|---|---|---|
| `admin@eventos.com` | ADMIN | `senha123` |
| `alice@example.com` | USER | `senha123` |
| `bob@example.com` | USER | `senha123` |
| `carol@example.com` | USER | `senha123` |

O token de certificado ativo é `token-workshop-2025` (Workshop de JavaScript). Use `GET /certificates/token-workshop-2025` autenticado como Alice. O token `token-seminario-2025` vem inativo.

## Endpoints

As rotas protegidas exigem o header `Authorization: Bearer <access_token>`.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventos.com","password":"senha123"}'
```

A resposta tem o formato `{ access_token, user }`.

### Auth

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | Público | Autentica e retorna o JWT |

### Usuários

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/users` | Público | Cadastra um usuário |
| `GET` | `/users` | Autenticado | Lista os usuários |
| `GET` | `/users/:id` | Autenticado | Busca um usuário |
| `PATCH` | `/users/:id` | Autenticado | Atualiza um usuário |
| `DELETE` | `/users/:id` | Autenticado | Remove um usuário |

### Eventos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/events` | Autenticado | Lista os eventos |
| `GET` | `/events/:id` | Autenticado | Busca um evento |
| `POST` | `/events` | ADMIN | Cria um evento |
| `PATCH` | `/events/:id` | ADMIN | Atualiza um evento |
| `DELETE` | `/events/:id` | ADMIN | Remove um evento |

### Inscrições

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/registrations` | Autenticado | Inscreve o usuário logado (`{ eventId }`) |
| `GET` | `/registrations/me` | Autenticado | Lista as inscrições do usuário logado |
| `GET` | `/registrations/event/:eventId` | ADMIN | Lista as inscrições de um evento |
| `GET` | `/registrations/:id/qrcode` | Dono ou ADMIN | Retorna o QR Code (PNG) da inscrição |
| `PATCH` | `/registrations/:id/checkin` | Dono ou ADMIN | Faz o check-in (status → `CONFIRMADO`) |
| `PATCH` | `/registrations/:id/cancel` | Dono | Cancela a inscrição |
| `PATCH` | `/registrations/:id/certificate` | ADMIN | Libera o certificado manualmente |
| `DELETE` | `/registrations/:id` | ADMIN | Remove a inscrição |

### Sessões de certificado

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/event-certificate-sessions` | ADMIN | Cria uma sessão com token aleatório (`{ eventId }`) |
| `GET` | `/event-certificate-sessions/event/:eventId` | ADMIN | Lista as sessões de um evento |
| `PATCH` | `/event-certificate-sessions/:id/activate` | ADMIN | Ativa a sessão |
| `PATCH` | `/event-certificate-sessions/:id/deactivate` | ADMIN | Desativa a sessão |
| `DELETE` | `/event-certificate-sessions/:id` | ADMIN | Remove a sessão |

### Certificados

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/certificates/:token` | Autenticado | Baixa o PDF pelo token de uma sessão ativa |
| `GET` | `/certificates/registration/:registrationId` | Dono | Baixa o PDF pela inscrição |

O certificado só é emitido para inscrições com status `CONFIRMADO` e com o certificado liberado.

## Limitações Conhecidas

- Não há testes automatizados: o Vitest está configurado, mas o projeto não tem nenhum arquivo `*.spec.ts`.
- `POST /users` é público e aceita o campo `role`, então qualquer pessoa pode se cadastrar como `ADMIN`.
- `PATCH` e `DELETE /users/:id` exigem apenas autenticação, sem verificar se quem chama é o próprio usuário ou um ADMIN.
- A contagem de vagas (`countByEvent`) inclui inscrições `CANCELADO`, então um cancelamento não libera a vaga.
- O próprio participante pode fazer o check-in na sua inscrição, o que libera o certificado automaticamente.
- O CORS está liberado para qualquer origem e não existe documentação Swagger/OpenAPI.
- O script `format` aponta para `test/**/*.ts`, uma pasta que não existe. Também não há scripts npm para migrate ou seed, então é preciso usar `npx prisma`.
