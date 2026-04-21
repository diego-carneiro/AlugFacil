# AlugFácil Consultórios — Arquitetura Completa

## 1. Visão Geral do Produto

AlugFácil é um **marketplace B2B de consultórios odontológicos** que conecta dois perfis:

- **Locatário (Dentista):** profissional autônomo que precisa de espaço para atender pacientes sem ter consultório próprio.
- **Locador (Proprietário):** clínica ou dentista com consultório que possui horários ociosos e quer monetizá-los.

A plataforma automatiza todo o ciclo de vida de uma locação:

```
Busca → Reserva → Pagamento → Vistoria (check-in) → Atendimento → Vistoria (check-out) → Avaliação mútua
```

---

## 2. Frontend — Resumo do que já existe

Stack: **React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion**

### Telas implementadas

| Rota | Tela |
|---|---|
| `/` | Home (landing page) |
| `/consultorios` | Catálogo com filtros (bairro, preço, equipamentos) |
| `/consultorios/:id` | Detalhe do consultório + booking modal |
| `/cadastrar` | Formulário de cadastro de consultório |
| `/entrar` | Login com 3 perfis demo |
| `/cadastro` | Register multi-step (role → dados → profissional) |
| `/dashboard/locatario` | Dashboard do dentista |
| `/dashboard/proprietario` | Dashboard do proprietário |
| `/dashboard/admin` | Painel administrativo |

### Modais implementados
- **BookingModal** — calendário + período + confirmação
- **ReviewModal** — avaliação 1–5 estrelas + comentário
- **InspectionModal** — checklist de vistoria check-in/check-out
- **PremiumModal** — upsell de destaque premium

### Estado atual
Todo o estado é **mock/local**. O `AuthContext` simula autenticação com `login(role)`. Os dados vêm de arquivos `.ts` estáticos em `src/data/`. O objetivo agora é conectar esse frontend a um backend real usando **AWS Amplify Gen2**.

---

## 3. Por que AWS Amplify Gen2?

Amplify Gen2 (lançado em 2024) é uma reescrita completa do Amplify. As diferenças chave em relação ao Gen1:

| | Gen1 | Gen2 |
|---|---|---|
| Configuração | JSON/YAML via CLI interativo | TypeScript puro (`amplify/backend.ts`) |
| Infraestrutura | Cloudformation gerado automaticamente | CDK explícito, customizável |
| Dev local | `amplify mock` limitado | `ampx sandbox` — nuvem real isolada por dev |
| Type safety | Geração de código separada | Schema → tipos gerados automaticamente |
| Deploy | `amplify push` | `ampx pipeline-deploy` ou Amplify Hosting |

**Para o AlugFácil, Amplify Gen2 entrega toda a infraestrutura necessária sem gerenciar servidores:**

- Autenticação → **Amazon Cognito**
- Banco de dados → **Amazon DynamoDB** via **AWS AppSync** (GraphQL)
- Lógica de negócio → **AWS Lambda**
- Armazenamento de arquivos → **Amazon S3**
- Hospedagem + CI/CD → **Amplify Hosting**
- Notificações → **Amazon SES** (email) + **Amazon SNS** (push)

---

## 4. Instalação e Configuração do Amplify Gen2

### 4.1 Pré-requisitos

```bash
# Node.js 18+ e npm
node -v  # >= 18

# AWS CLI configurado
aws configure
# AWS Access Key ID: [sua key]
# AWS Secret Access Key: [sua secret]
# Default region: us-east-1
# Default output format: json

# Conta AWS com permissões de AdministratorAccess (para dev)
```

### 4.2 Adicionar Amplify ao projeto existente

```bash
# Na raiz do projeto Vite já existente
cd alugfacil

# Instalar dependências de build/dev
npm add -D @aws-amplify/backend @aws-amplify/backend-cli

# Instalar client library (usado pelo React)
npm add aws-amplify

# Instalar types do Node para as Lambda functions
npm add -D @types/node @types/aws-lambda
```

### 4.3 Estrutura de pastas que será criada

```
alugfacil/
├── amplify/                          ← TODA a infraestrutura como código
│   ├── backend.ts                    ← Entry point: registra todos os recursos
│   ├── auth/
│   │   └── resource.ts               ← Cognito User Pool
│   ├── data/
│   │   └── resource.ts               ← AppSync + DynamoDB (schema GraphQL)
│   ├── storage/
│   │   └── resource.ts               ← S3 buckets
│   └── functions/
│       ├── processPayment/
│       │   ├── handler.ts
│       │   └── resource.ts
│       ├── sendNotification/
│       │   ├── handler.ts
│       │   └── resource.ts
│       ├── confirmBooking/
│       │   ├── handler.ts
│       │   └── resource.ts
│       ├── updateRating/
│       │   ├── handler.ts
│       │   └── resource.ts
│       ├── verifyDocument/
│       │   ├── handler.ts
│       │   └── resource.ts
│       └── premiumScheduler/
│           ├── handler.ts
│           └── resource.ts
├── src/                              ← Frontend React (já existe)
├── package.json
└── vite.config.ts
```

### 4.4 Arquivo principal do backend

```typescript
// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { processPayment } from "./functions/processPayment/resource";
import { sendNotification } from "./functions/sendNotification/resource";
import { confirmBooking } from "./functions/confirmBooking/resource";
import { updateRating } from "./functions/updateRating/resource";
import { verifyDocument } from "./functions/verifyDocument/resource";
import { premiumScheduler } from "./functions/premiumScheduler/resource";

defineBackend({
  auth,
  data,
  storage,
  processPayment,
  sendNotification,
  confirmBooking,
  updateRating,
  verifyDocument,
  premiumScheduler,
});
```

### 4.5 Sandbox (ambiente de desenvolvimento local)

```bash
# Cria um ambiente isolado na AWS para o seu usuário (não afeta prod)
npx ampx sandbox

# A cada mudança em amplify/, o sandbox faz hot-reload automático na nuvem
# Gera automaticamente o arquivo: amplify_outputs.json
```

O `amplify_outputs.json` contém as URLs e IDs de todos os serviços criados. O frontend React o consome assim:

```typescript
// src/main.tsx
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
```

---

## 5. Autenticação — Amazon Cognito

### 5.1 O que o Cognito entrega

- Registro e login de usuários com verificação por e-mail
- JWT tokens (ID Token, Access Token, Refresh Token)
- Grupos de usuários com permissões diferentes
- Atributos customizados (CRO, especialidade, papel)
- MFA opcional (SMS ou TOTP)
- Integração automática com AppSync para autorização

### 5.2 Configuração

```typescript
// amplify/auth/resource.ts
import { defineAuth, secret } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Confirme seu cadastro no AlugFácil",
      verificationEmailBody: (createCode) =>
        `Seu código de verificação: ${createCode()}`,
    },
  },
  userAttributes: {
    // Atributos padrão
    email: { required: true, mutable: false },
    phoneNumber: { required: false, mutable: true },
    // Atributos customizados
    "custom:role": {
      dataType: "String",      // "TENANT" | "OWNER" | "ADMIN"
      mutable: true,
    },
    "custom:cro": {
      dataType: "String",      // "CRO-SP 12345"
      mutable: true,
    },
    "custom:specialty": {
      dataType: "String",      // "Ortodontia", "Implantodontia", etc.
      mutable: true,
    },
    "custom:verified": {
      dataType: "String",      // "true" | "false" (admin aprova)
      mutable: true,
    },
  },
  groups: ["TENANT", "OWNER", "ADMIN"],
  // Triggers Lambda no ciclo de vida do usuário
  triggers: {
    // Executado após confirmação do e-mail
    postConfirmation: confirmBooking, // reutiliza a function ou cria uma dedicada
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: false,
    requireNumbers: true,
    requireSpecialCharacters: false,
  },
});
```

### 5.3 Fluxo de cadastro com atribuição de grupo

Quando o usuário completa o cadastro no frontend, além de criar a conta no Cognito, uma Lambda é chamada para:
1. Adicioná-lo ao grupo correto (`TENANT` ou `OWNER`)
2. Criar o registro correspondente no DynamoDB
3. Disparar e-mail de boas-vindas

```typescript
// amplify/functions/confirmBooking/handler.ts (PostConfirmation trigger)
import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({});

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const role = event.request.userAttributes["custom:role"] ?? "TENANT";

  // Adiciona ao grupo correspondente no Cognito
  await cognito.send(new AdminAddUserToGroupCommand({
    UserPoolId: event.userPoolId,
    Username: event.userName,
    GroupName: role,
  }));

  // Aqui também criaria o registro User no DynamoDB via AppSync
  // (ver seção de banco de dados)

  return event;
};
```

---

## 6. Banco de Dados — DynamoDB via AppSync

### 6.1 Como funciona a camada de dados no Amplify Gen2

```
Frontend React
     ↓ (operações GraphQL)
AWS AppSync (gerenciado — sem servidor)
     ↓ (resolvers automáticos)
Amazon DynamoDB (NoSQL — sem servidor)
```

O Amplify Gen2 usa um **schema GraphQL com anotações de autorização** para gerar automaticamente:
- Tabelas DynamoDB para cada `model`
- Índices GSI para relacionamentos e queries frequentes
- Resolvers AppSync (CRUD completo)
- Types TypeScript para o frontend
- Regras de autorização baseadas no Cognito

### 6.2 Filosofia de modelagem

DynamoDB é um banco **NoSQL orientado a acesso**. Diferente do PostgreSQL, você modela os dados pensando nas queries que vai executar, não na normalização.

**Amplify Gen2 usa multi-table** (uma tabela por modelo), o que simplifica a modelagem para aplicações que não precisam de consultas extremamente complexas.

Cada tabela tem:
- Partition key: `id` (UUID gerado automaticamente)
- Sort key: não necessária (Amplify gerencia)
- GSIs criados automaticamente para campos de relacionamento (`belongsTo`)

### 6.3 Schema completo dos dados

```typescript
// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({

  // ─────────────────────────────────────────────
  // USUÁRIO
  // ─────────────────────────────────────────────
  User: a.model({
    // Identidade
    cognitoId: a.string().required(),          // sub do Cognito
    name: a.string().required(),
    email: a.email().required(),
    phone: a.phone(),
    role: a.enum(["TENANT", "OWNER", "ADMIN"]),
    avatarKey: a.string(),                     // chave S3 do avatar

    // Dados profissionais (dentista)
    cro: a.string(),
    specialty: a.string(),
    verified: a.boolean().default(false),

    // Reputação
    rating: a.float().default(0),
    totalReviews: a.integer().default(0),

    // Relacionamentos
    ownedConsultories: a.hasMany("Consultory", "ownerId"),
    tenantBookings:    a.hasMany("Booking",    "tenantId"),
    ownerBookings:     a.hasMany("Booking",    "ownerId"),
    givenReviews:      a.hasMany("Review",     "fromUserId"),
    receivedReviews:   a.hasMany("Review",     "toUserId"),
  })
  .identifier(["cognitoId"])                   // usa sub do Cognito como ID
  .authorization((allow) => [
    allow.owner(),                             // usuário vê/edita só o próprio
    allow.groups(["ADMIN"]),                   // admin vê todos
    allow.authenticated().to(["read"]),        // qualquer logado lê dados básicos
  ]),

  // ─────────────────────────────────────────────
  // CONSULTÓRIO
  // ─────────────────────────────────────────────
  Consultory: a.model({
    name:             a.string().required(),
    description:      a.string(),
    neighborhood:     a.string().required(),
    city:             a.string().required(),
    state:            a.string().required(),
    address:          a.string(),
    zipCode:          a.string(),
    latitude:         a.float(),               // para busca por geolocalização futura
    longitude:        a.float(),

    // Preço
    pricePerPeriod: a.float().required(),

    // Equipamentos (lista de strings)
    equipment: a.string().array(),

    // Disponibilidade por período
    periodMorning:   a.boolean().default(false),
    periodAfternoon: a.boolean().default(false),
    periodEvening:   a.boolean().default(false),

    // Metadados
    featured:    a.boolean().default(false),
    isPremium:   a.boolean().default(false),
    premiumUntil: a.datetime(),

    // Reputação
    rating:       a.float().default(0),
    totalReviews: a.integer().default(0),

    // WhatsApp de fallback (MVP)
    whatsappNumber: a.string(),

    // Relacionamentos
    ownerId:  a.id().required(),
    owner:    a.belongsTo("User", "ownerId"),
    bookings: a.hasMany("Booking", "consultoryId"),
    images:   a.hasMany("ConsultoryImage", "consultoryId"),
  })
  .authorization((allow) => [
    allow.publicApiKey().to(["read"]),         // público pode listar/ver
    allow.owner().to(["create", "update", "delete"]),
    allow.groups(["ADMIN"]),
  ]),

  // ─────────────────────────────────────────────
  // IMAGENS DO CONSULTÓRIO (referências S3)
  // ─────────────────────────────────────────────
  ConsultoryImage: a.model({
    s3Key:       a.string().required(),        // chave no bucket S3
    order:       a.integer().default(0),       // ordem de exibição
    consultoryId: a.id().required(),
    consultory:   a.belongsTo("Consultory", "consultoryId"),
  })
  .authorization((allow) => [
    allow.publicApiKey().to(["read"]),
    allow.owner().to(["create", "update", "delete"]),
    allow.groups(["ADMIN"]),
  ]),

  // ─────────────────────────────────────────────
  // RESERVA
  // ─────────────────────────────────────────────
  Booking: a.model({
    // Data e período
    date:   a.date().required(),               // "2026-04-20"
    period: a.enum(["MORNING", "AFTERNOON", "EVENING"]),

    // Status do ciclo de vida
    status: a.enum([
      "PENDING",     // aguardando confirmação do proprietário
      "CONFIRMED",   // confirmada, aguardando atendimento
      "CHECKED_IN",  // dentista fez check-in + vistoria de entrada
      "COMPLETED",   // atendimento concluído, check-out feito
      "CANCELLED",   // cancelada
      "DISPUTED",    // em disputa (admin intervém)
    ]),

    // Financeiro
    price:       a.float().required(),
    platformFee: a.float(),                    // comissão AlugFácil (10%)
    ownerAmount: a.float(),                    // valor líquido ao proprietário

    // Flags de progresso
    reviewedByTenant: a.boolean().default(false),
    reviewedByOwner:  a.boolean().default(false),

    // Pagamento
    paymentStatus:  a.enum(["PENDING", "PAID", "REFUNDED"]),
    paymentIntentId: a.string(),               // ID do Stripe/Pagar.me

    // Relacionamentos
    consultoryId: a.id().required(),
    consultory:   a.belongsTo("Consultory", "consultoryId"),
    tenantId:     a.id().required(),
    tenant:       a.belongsTo("User", "tenantId"),
    ownerId:      a.id().required(),
    owner:        a.belongsTo("User", "ownerId"),

    // Sub-recursos
    inspection:  a.hasOne("Inspection", "bookingId"),
    review:      a.hasMany("Review", "bookingId"),
    payment:     a.hasOne("Payment", "bookingId"),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(["ADMIN"]),
  ]),

  // ─────────────────────────────────────────────
  // VISTORIA (check-in e check-out)
  // ─────────────────────────────────────────────
  Inspection: a.model({
    type: a.enum(["CHECK_IN", "CHECK_OUT"]),

    // Itens do checklist (JSON stringificado)
    // Estrutura: [{ id, label, status: "OK"|"DAMAGED"|"MISSING", notes }]
    checklistJson: a.string(),

    // Fotos (chaves S3)
    photoKeys: a.string().array(),

    // Assinatura digital (base64 ou confirmação)
    signedAt: a.datetime(),
    signedBy: a.string(),                      // cognitoId de quem assinou

    bookingId:  a.id().required(),
    booking:    a.belongsTo("Booking", "bookingId"),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(["ADMIN"]),
  ]),

  // ─────────────────────────────────────────────
  // AVALIAÇÃO
  // ─────────────────────────────────────────────
  Review: a.model({
    rating:  a.integer().required(),           // 1 a 5
    comment: a.string(),
    type: a.enum(["TENANT_TO_OWNER", "OWNER_TO_TENANT"]),

    fromUserId:      a.id().required(),
    fromUser:        a.belongsTo("User", "fromUserId"),
    toUserId:        a.id().required(),
    toUser:          a.belongsTo("User", "toUserId"),
    bookingId:       a.id().required(),
    booking:         a.belongsTo("Booking", "bookingId"),
    consultoryId:    a.id().required(),
    consultory:      a.belongsTo("Consultory", "consultoryId"),
  })
  .authorization((allow) => [
    allow.owner().to(["create"]),              // só quem fez pode criar
    allow.authenticated().to(["read"]),        // todos logados podem ler
    allow.groups(["ADMIN"]),
  ]),

  // ─────────────────────────────────────────────
  // PAGAMENTO
  // ─────────────────────────────────────────────
  Payment: a.model({
    amount:         a.float().required(),
    platformFee:    a.float().required(),
    ownerAmount:    a.float().required(),
    currency:       a.string().default("BRL"),

    // Stripe/Pagar.me
    provider:           a.enum(["STRIPE", "PAGARME"]),
    providerPaymentId:  a.string(),
    providerChargeId:   a.string(),
    status: a.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"]),

    // Repasse ao proprietário
    transferId:   a.string(),
    transferredAt: a.datetime(),

    bookingId: a.id().required(),
    booking:   a.belongsTo("Booking", "bookingId"),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(["ADMIN"]),
  ]),

  // ─────────────────────────────────────────────
  // DISPONIBILIDADE (calendário do proprietário)
  // ─────────────────────────────────────────────
  Availability: a.model({
    consultoryId: a.id().required(),
    consultory:   a.belongsTo("Consultory", "consultoryId"),
    date:         a.date().required(),
    period:       a.enum(["MORNING", "AFTERNOON", "EVENING"]),
    isAvailable:  a.boolean().default(true),   // false = bloqueado pelo proprietário
  })
  .authorization((allow) => [
    allow.publicApiKey().to(["read"]),
    allow.owner().to(["create", "update", "delete"]),
    allow.groups(["ADMIN"]),
  ]),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // Acesso público (sem login) para listar consultórios
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
```

### 6.4 Índices GSI gerados automaticamente

O Amplify cria GSIs para todos os campos de relacionamento. Além deles, você pode adicionar índices customizados:

| Tabela | GSI | Partition Key | Sort Key | Uso |
|---|---|---|---|---|
| Booking | byTenant | tenantId | date | Reservas de um dentista ordenadas por data |
| Booking | byOwner | ownerId | date | Reservas de um proprietário ordenadas por data |
| Booking | byConsultory | consultoryId | date | Agenda de um consultório |
| Booking | byStatus | status | date | Todas as reservas por status (admin) |
| Consultory | byCity | city | neighborhood | Busca por localização |
| Consultory | byOwner | ownerId | createdAt | Salas de um proprietário |
| Availability | byConsultory | consultoryId | date | Agenda de disponibilidade |

### 6.5 Como o frontend consome os dados

```typescript
// src/data/api.ts — substitui os arquivos mock .ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

export const client = generateClient<Schema>();

// Listar consultórios disponíveis (sem login)
export const listConsultories = () =>
  client.models.Consultory.list({
    authMode: "apiKey",
  });

// Buscar por cidade
export const listConsultoriesByCity = (city: string) =>
  client.models.Consultory.list({
    filter: { city: { eq: city } },
    authMode: "apiKey",
  });

// Criar reserva (requer login)
export const createBooking = (input: {
  consultoryId: string;
  date: string;
  period: "MORNING" | "AFTERNOON" | "EVENING";
  price: number;
}) =>
  client.models.Booking.create({
    ...input,
    status: "PENDING",
    paymentStatus: "PENDING",
    reviewedByTenant: false,
    reviewedByOwner: false,
  });

// Subscription em tempo real: proprietário recebe nova reserva
export const onNewBookingForOwner = (ownerId: string, callback: Function) =>
  client.models.Booking.onCreate({
    filter: { ownerId: { eq: ownerId } },
  }).subscribe({ next: (data) => callback(data) });
```

---

## 7. Storage — Amazon S3

### 7.1 Buckets necessários

| Bucket lógico | Conteúdo | Acesso |
|---|---|---|
| `consultory-images` | Fotos dos consultórios | Leitura pública, escrita só do proprietário dono |
| `inspection-photos` | Fotos de vistoria | Leitura do tenant e owner envolvidos, escrita de ambos |
| `avatars` | Fotos de perfil | Leitura pública, escrita só do próprio usuário |
| `documents` | CRO, CNPJ, documentos de verificação | Leitura só do admin, escrita do próprio usuário |

### 7.2 Configuração

```typescript
// amplify/storage/resource.ts
import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "alugfacilStorage",
  access: (allow) => ({

    // Fotos de consultórios: público para leitura
    "consultory-images/{entity_id}/*": [
      allow.guest.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
    ],

    // Fotos de vistoria: só participantes da reserva
    "inspection-photos/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.groups(["ADMIN"]).to(["read"]),
    ],

    // Avatares: público para leitura
    "avatars/{entity_id}/*": [
      allow.guest.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
    ],

    // Documentos: privado
    "documents/{entity_id}/*": [
      allow.entity("identity").to(["read", "write"]),
      allow.groups(["ADMIN"]).to(["read", "write"]),
    ],
  }),
});
```

### 7.3 Upload no frontend

```typescript
// src/utils/storage.ts
import { uploadData, getUrl, remove } from "aws-amplify/storage";

// Upload de foto de consultório
export const uploadConsultoryImage = async (
  file: File,
  consultoryId: string
): Promise<string> => {
  const key = `consultory-images/${consultoryId}/${Date.now()}-${file.name}`;
  await uploadData({ key, data: file, options: { contentType: file.type } }).result;
  return key; // salva esta chave no DynamoDB (ConsultoryImage.s3Key)
};

// Obter URL pública de uma imagem
export const getImageUrl = async (key: string): Promise<string> => {
  const result = await getUrl({ key, options: { expiresIn: 3600 } });
  return result.url.toString();
};

// Upload de foto de vistoria
export const uploadInspectionPhoto = async (
  file: File,
  bookingId: string
): Promise<string> => {
  const key = `inspection-photos/${bookingId}/${Date.now()}-${file.name}`;
  await uploadData({ key, data: file, options: { contentType: file.type } }).result;
  return key;
};
```

---

## 8. Funções Lambda — Lógica de Negócio

### 8.1 Visão geral das funções

| Função | Trigger | Responsabilidade |
|---|---|---|
| `processPayment` | HTTP (API Gateway) | Criar intent de pagamento no Stripe, processar cobrança |
| `confirmBooking` | DynamoDB Stream (Booking criado) | Notificar proprietário de nova reserva |
| `sendNotification` | Invocação direta + SES/SNS | Disparar e-mails e push notifications |
| `updateRating` | DynamoDB Stream (Review criada) | Recalcular média de avaliação do usuário e consultório |
| `verifyDocument` | HTTP (admin chama) | Marcar usuário como verificado no Cognito + DynamoDB |
| `premiumScheduler` | EventBridge (diário 00:00) | Verificar expiração de Premium e rebaixar consultórios |
| `stripeWebhook` | HTTP (Stripe chama) | Confirmar pagamento recebido, disparar repasse |

### 8.2 Configuração das funções

```typescript
// amplify/functions/processPayment/resource.ts
import { defineFunction, secret } from "@aws-amplify/backend";

export const processPayment = defineFunction({
  name: "processPayment",
  entry: "./handler.ts",
  runtime: 20,                    // Node.js 20
  timeoutSeconds: 30,
  environment: {
    STRIPE_SECRET_KEY: secret("STRIPE_SECRET_KEY"),
    PLATFORM_FEE_PERCENT: "10",
  },
});
```

```typescript
// amplify/functions/premiumScheduler/resource.ts
import { defineFunction } from "@aws-amplify/backend";
import { Schedule } from "aws-cdk-lib/aws-events";

export const premiumScheduler = defineFunction({
  name: "premiumScheduler",
  entry: "./handler.ts",
  schedule: Schedule.cron({ hour: "0", minute: "0" }), // todo dia à meia-noite
});
```

### 8.3 Implementação: Processar Pagamento

```typescript
// amplify/functions/processPayment/handler.ts
import Stripe from "stripe";
import type { APIGatewayProxyHandler } from "aws-lambda";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const FEE = Number(process.env.PLATFORM_FEE_PERCENT!) / 100;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { bookingId, amount, currency = "brl", ownerStripeAccountId } = JSON.parse(event.body!);

    const platformFee = Math.round(amount * FEE);

    // Cria um PaymentIntent com split automático para o proprietário
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,        // Stripe usa centavos
      currency,
      application_fee_amount: platformFee * 100,
      transfer_data: {
        destination: ownerStripeAccountId,
      },
      metadata: { bookingId },
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao processar pagamento" }),
    };
  }
};
```

### 8.4 Implementação: Webhook do Stripe

```typescript
// amplify/functions/stripeWebhook/handler.ts
import Stripe from "stripe";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const dynamo = new DynamoDBClient({});
const ses = new SESClient({});

export const handler = async (event: any) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return { statusCode: 400, body: "Invalid signature" };
  }

  if (stripeEvent.type === "payment_intent.succeeded") {
    const intent = stripeEvent.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;

    // Atualiza status de pagamento no DynamoDB
    await dynamo.send(new UpdateItemCommand({
      TableName: process.env.BOOKING_TABLE!,
      Key: { id: { S: bookingId } },
      UpdateExpression: "SET paymentStatus = :paid, #status = :confirmed",
      ExpressionAttributeValues: {
        ":paid": { S: "PAID" },
        ":confirmed": { S: "CONFIRMED" },
      },
      ExpressionAttributeNames: { "#status": "status" },
    }));

    // Envia e-mail de confirmação para o dentista
    // (ver função sendNotification)
  }

  return { statusCode: 200, body: "OK" };
};
```

### 8.5 Implementação: Atualizar Avaliação (Stream)

```typescript
// amplify/functions/updateRating/handler.ts
import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDBClient, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({});

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName !== "INSERT") continue;

    const review = record.dynamodb?.NewImage;
    if (!review) continue;

    const toUserId     = review.toUserId.S!;
    const consultoryId = review.consultoryId.S!;

    // Recalcula média do usuário avaliado
    await recalculateRating("User", toUserId, "toUserId");

    // Recalcula média do consultório
    await recalculateRating("Consultory", consultoryId, "consultoryId");
  }
};

async function recalculateRating(table: string, id: string, indexKey: string) {
  const result = await dynamo.send(new QueryCommand({
    TableName: process.env[`${table.toUpperCase()}_TABLE`],
    IndexName: `by${table}`,
    KeyConditionExpression: `${indexKey} = :id`,
    ExpressionAttributeValues: { ":id": { S: id } },
    ProjectionExpression: "rating",
  }));

  const ratings = (result.Items ?? []).map(i => Number(i.rating?.N ?? 0));
  const avg = ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);

  await dynamo.send(new UpdateItemCommand({
    TableName: process.env[`${table.toUpperCase()}_TABLE`],
    Key: { id: { S: id } },
    UpdateExpression: "SET rating = :avg, totalReviews = :count",
    ExpressionAttributeValues: {
      ":avg":   { N: avg.toFixed(2) },
      ":count": { N: String(ratings.length) },
    },
  }));
}
```

### 8.6 Implementação: Premium Scheduler

```typescript
// amplify/functions/premiumScheduler/handler.ts
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({});

export const handler = async () => {
  const now = new Date().toISOString();

  // Busca consultórios premium com data de expiração no passado
  const result = await dynamo.send(new ScanCommand({
    TableName: process.env.CONSULTORY_TABLE!,
    FilterExpression: "isPremium = :true AND premiumUntil < :now",
    ExpressionAttributeValues: {
      ":true": { BOOL: true },
      ":now":  { S: now },
    },
  }));

  for (const item of result.Items ?? []) {
    await dynamo.send(new UpdateItemCommand({
      TableName: process.env.CONSULTORY_TABLE!,
      Key: { id: item.id },
      UpdateExpression: "SET isPremium = :false, featured = :false",
      ExpressionAttributeValues: {
        ":false": { BOOL: false },
      },
    }));
  }

  console.log(`Premium expirado em ${result.Items?.length ?? 0} consultórios`);
};
```

---

## 9. Notificações — SES + SNS

### 9.1 Eventos que disparam notificações

| Evento | Destinatário | Canal |
|---|---|---|
| Nova reserva criada | Proprietário | E-mail |
| Reserva confirmada | Dentista | E-mail + Push |
| Reserva cancelada | Ambos | E-mail |
| Pagamento confirmado | Dentista + Proprietário | E-mail |
| Avaliação recebida | Usuário avaliado | E-mail |
| Vistoria pendente | Ambos | E-mail + Push |
| Premium expirando em 3 dias | Proprietário | E-mail |

### 9.2 Configuração do SES

O Amazon SES exige verificação de domínio em produção. Em sandbox (dev), apenas e-mails verificados individualmente.

```typescript
// amplify/functions/sendNotification/handler.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "us-east-1" });

type NotificationPayload = {
  to: string;
  templateId: "NEW_BOOKING" | "BOOKING_CONFIRMED" | "PAYMENT_CONFIRMED" | "NEW_REVIEW";
  data: Record<string, string>;
};

const TEMPLATES: Record<string, { subject: string; html: (d: any) => string }> = {
  NEW_BOOKING: {
    subject: "Nova reserva recebida — AlugFácil",
    html: (d) => `
      <h2>Você recebeu uma nova reserva!</h2>
      <p><strong>Dentista:</strong> ${d.tenantName}</p>
      <p><strong>Consultório:</strong> ${d.consultoryName}</p>
      <p><strong>Data:</strong> ${d.date} — ${d.period}</p>
      <p><a href="${d.dashboardUrl}">Confirmar reserva</a></p>
    `,
  },
  BOOKING_CONFIRMED: {
    subject: "Reserva confirmada — AlugFácil",
    html: (d) => `
      <h2>Sua reserva foi confirmada!</h2>
      <p><strong>Consultório:</strong> ${d.consultoryName}</p>
      <p><strong>Data:</strong> ${d.date} — ${d.period}</p>
      <p>Lembre-se de fazer o check-in via app antes de começar.</p>
    `,
  },
  // ... demais templates
};

export const handler = async (payload: NotificationPayload) => {
  const template = TEMPLATES[payload.templateId];

  await ses.send(new SendEmailCommand({
    Source: "noreply@alugfacil.com.br",
    Destination: { ToAddresses: [payload.to] },
    Message: {
      Subject: { Data: template.subject },
      Body: {
        Html: { Data: template.html(payload.data) },
      },
    },
  }));
};
```

---

## 10. Fluxos End-to-End Completos

### 10.1 Fluxo: Agendamento + Pagamento

```
1. Dentista abre BookingModal → seleciona data e período
2. Frontend chama client.models.Booking.create() → cria registro PENDING no DynamoDB
3. DynamoDB Stream dispara Lambda confirmBooking
4. confirmBooking → invoca sendNotification → e-mail para proprietário
5. Proprietário vê reserva no dashboard → clica "Confirmar"
6. Frontend chama client.models.Booking.update({ status: "CONFIRMED" })
7. Frontend chama Lambda processPayment via API Gateway → obtém clientSecret do Stripe
8. Dentista insere dados do cartão (Stripe Elements no frontend)
9. Stripe processa → chama stripeWebhook Lambda
10. stripeWebhook atualiza Booking.paymentStatus = PAID
11. stripeWebhook invoca sendNotification → e-mail de confirmação para ambos
```

### 10.2 Fluxo: Vistoria

```
1. Dentista chega ao consultório → abre InspectionModal (check-in)
2. Preenche checklist + tira fotos
3. Fotos: uploadInspectionPhoto() → S3
4. Frontend cria Inspection no DynamoDB com photoKeys + checklistJson
5. Booking.status atualiza para CHECKED_IN
6. Após atendimento: repete o processo para check-out
7. Booking.status atualiza para COMPLETED
8. Ambos recebem notificação para avaliar
```

### 10.3 Fluxo: Avaliação

```
1. Ambos recebem e-mail com link para avaliar
2. Dentista abre ReviewModal → 5 estrelas + comentário
3. Frontend cria Review no DynamoDB
4. DynamoDB Stream dispara updateRating Lambda
5. Lambda recalcula média do proprietário e do consultório
6. Usuário avaliado recebe notificação por e-mail
```

---

## 11. CI/CD e Hospedagem — Amplify Hosting

### 11.1 Conectar repositório

```bash
# No console AWS Amplify, conectar repositório GitHub
# Amplify detecta automaticamente o projeto Vite

# Ou via CLI:
npx ampx configure
```

### 11.2 Configuração de branches

| Branch | Ambiente | URL |
|---|---|---|
| `main` | Produção | `alugfacil.com.br` |
| `develop` | Staging | `dev.alugfacil.com.br` |
| `feature/*` | Preview automático | URL gerada por PR |

### 11.3 amplify.yml

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx ampx generate outputs --branch $AWS_BRANCH --app-id $AWS_APP_ID
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### 11.4 Secrets e variáveis de ambiente

```bash
# Adicionar secrets ao ambiente Amplify
npx ampx sandbox secret set STRIPE_SECRET_KEY
npx ampx sandbox secret set STRIPE_WEBHOOK_SECRET

# No Amplify Console (produção):
# App Settings → Environment Variables → adicionar as mesmas chaves
```

---

## 12. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)               │
│              Amplify Hosting (CDN CloudFront)            │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │ Cognito │  │ AppSync  │  │   S3    │
   │  Auth   │  │ GraphQL  │  │ Storage │
   └─────────┘  └────┬─────┘  └─────────┘
                     │
                     ▼
              ┌────────────┐
              │  DynamoDB  │
              │  (tabelas) │
              └─────┬──────┘
                    │ Streams
                    ▼
             ┌─────────────────────────────┐
             │        Lambda Functions      │
             │  ┌─────────┐ ┌───────────┐  │
             │  │ confirm │ │  update   │  │
             │  │ booking │ │  rating   │  │
             │  └─────────┘ └───────────┘  │
             └─────────────────────────────┘
                    │
          ┌─────────┼───────────┐
          ▼         ▼           ▼
       ┌─────┐   ┌─────┐   ┌────────┐
       │ SES │   │ SNS │   │ Stripe │
       │Email│   │Push │   │Payment │
       └─────┘   └─────┘   └────────┘
```

---

## 13. Estimativa de Custos (AWS Free Tier + produção inicial)

| Serviço | Free Tier | Custo aproximado (1.000 usuários/mês) |
|---|---|---|
| Cognito | 50.000 MAU grátis | $0 |
| AppSync | 250.000 req/mês grátis | ~$4/mês |
| DynamoDB | 25 GB + 200M req grátis | $0–$5/mês |
| Lambda | 1M invocações grátis | $0 |
| S3 | 5 GB grátis | ~$1/mês |
| SES | 62.000 emails/mês grátis (de EC2/Lambda) | $0 |
| Amplify Hosting | 1.000 build min/mês grátis | $0–$2/mês |
| **Total estimado** | | **~$5–$12/mês** |

---

## 14. Ordem de Implementação Recomendada

```
Fase 1 — Fundação (1–2 semanas)
  ✓ Configurar Amplify Gen2 no projeto
  ✓ Implementar auth/ (Cognito)
  ✓ Substituir AuthContext mock pelo Amplify real
  ✓ Implementar data/ com User e Consultory
  ✓ Substituir src/data/consultories.ts por queries reais

Fase 2 — Reservas (1–2 semanas)
  ✓ Adicionar Booking, Availability ao schema
  ✓ Lambda confirmBooking + sendNotification
  ✓ Conectar BookingModal ao DynamoDB real
  ✓ Dashboards consumindo dados reais

Fase 3 — Pagamentos (1–2 semanas)
  ✓ Conta Stripe + conta conectada para proprietários
  ✓ Lambda processPayment + stripeWebhook
  ✓ Fluxo de pagamento no BookingModal

Fase 4 — Vistoria + Avaliações (1 semana)
  ✓ Storage S3 + upload de fotos
  ✓ Schema Inspection e Review
  ✓ Lambda updateRating

Fase 5 — Premium + Admin (1 semana)
  ✓ PremiumModal conectado ao pagamento
  ✓ Lambda premiumScheduler
  ✓ AdminDashboard com dados reais + verifyDocument
```
