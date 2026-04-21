# Plano de Execucao - AlugFacil

## Objetivo

Migrar o AlugFacil de um frontend com estado mockado para uma aplicacao fullstack com AWS Amplify Gen2, mantendo o app utilizavel durante a transicao e reduzindo retrabalho.

## Estrategia Geral

A migracao deve acontecer em 5 fases, preservando o frontend atual enquanto os mocks sao substituidos por backend real. A ordem recomendada e:

1. Infraestrutura e autenticacao
2. Dados principais
3. Reservas
4. Storage, vistoria e avaliacoes
5. Pagamentos, admin e automacoes finais

---

## Fase 1 - Fundacao

### 1. Preparar ambiente local

Objetivo: garantir que o projeto rode no WSL2 com AWS e Node prontos para o Amplify Gen2.

Comandos no WSL2:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

node -v
npm -v
aws --version
git --version
```

Se precisar configurar AWS CLI:

```bash
aws configure
```

Voce vai informar:

- `AWS Access Key ID`
- `AWS Secret Access Key`
- `Default region name`: `us-east-1`
- `Default output format`: `json`

Cheque identidade:

```bash
aws sts get-caller-identity
```

O que validar:

- Node compativel
- AWS CLI autenticado
- Conta com permissao para criar recursos Amplify, Cognito, AppSync e DynamoDB

### 2. Instalar Amplify Gen2 no projeto

Objetivo: adicionar as dependencias necessarias sem alterar ainda o app.

Comandos no WSL2:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

npm add -D @aws-amplify/backend @aws-amplify/backend-cli
npm add aws-amplify
npm add -D @types/aws-lambda
```

Depois, confirme no `package.json` que as dependencias foram adicionadas.

Resultado esperado:

- o projeto continua buildando
- o frontend ainda funciona como antes
- o repositorio esta pronto para receber a pasta `amplify/`

### 3. Criar a base do backend Amplify

Objetivo: subir a fundacao minima do backend em codigo.

Estrutura inicial recomendada:

```text
amplify/
├── backend.ts
├── auth/
│   └── resource.ts
└── data/
    └── resource.ts
```

Ordem de criacao:

1. `amplify/backend.ts`
2. `amplify/auth/resource.ts`
3. `amplify/data/resource.ts`

O que entra nessa primeira versao:

- `auth`: login por email e senha
- `data`: apenas `User` e `Consultory`

O que ainda nao entra:

- `Booking`
- `Availability`
- `Storage`
- Lambdas
- Stripe
- SES e SNS

Motivo: reduzir risco e conectar primeiro as telas ja mais prontas.

### 4. Subir sandbox de desenvolvimento

Objetivo: criar o ambiente isolado por desenvolvedor na AWS.

Comando no WSL2:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

npx ampx sandbox
```

Esse comando deve:

- criar o backend na AWS
- observar mudancas em `amplify/`
- gerar `amplify_outputs.json`

Importante:

- esse processo normalmente fica rodando em um terminal
- deixe uma aba do terminal dedicada ao sandbox

Se quiser encerrar:

```bash
Ctrl + C
```

Resultado esperado:

- arquivo `amplify_outputs.json` criado na raiz
- backend minimo disponivel para o frontend consumir

### 5. Conectar o frontend ao Amplify

Objetivo: fazer o app reconhecer o backend criado.

Ajuste esperado em `src/main.tsx`:

- importar `Amplify`
- importar `amplify_outputs.json`
- chamar `Amplify.configure(outputs)`

Depois valide com build:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

npm run build
```

Resultado esperado:

- app continua compilando
- frontend ja esta preparado para usar auth e data reais

### 6. Migrar autenticacao mock para Cognito

Objetivo: trocar o `AuthContext` fake por autenticacao real.

Arquivos mais impactados:

- `src/context/AuthContext.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/Register.tsx`

O que implementar nessa etapa:

- `signUp`
- confirmacao de cadastro por codigo
- `signIn`
- `signOut`
- recuperar sessao do usuario autenticado
- mapear role do usuario

O que manter temporariamente:

- redirecionamento por perfil
- dashboards existentes
- UI atual

Resultado esperado:

- o login deixa de depender de usuarios hardcoded
- o cadastro cria usuarios reais no Cognito

### 7. Criar camada real de dados para `User` e `Consultory`

Objetivo: remover dependencia de `src/data/consultories.ts` e comecar a usar AppSync e DynamoDB.

Crie uma camada nova, por exemplo:

```text
src/lib/api/
├── client.ts
├── consultories.ts
└── users.ts
```

Responsabilidades:

- `client.ts`: `generateClient<Schema>()`
- `consultories.ts`: listagem, detalhe e filtros
- `users.ts`: leitura e criacao do perfil

Telas a migrar primeiro:

- `/consultorios`
- `/consultorios/:id`

Depois:

- dados do usuario logado

Resultado esperado:

- catalogo e detalhe passam a usar backend real
- `src/data/consultories.ts` vira legado temporario

### 8. Persistir perfil do usuario no banco

Objetivo: alem do Cognito, cada usuario precisa ter um registro de dominio no banco.

Fluxo recomendado:

1. usuario se cadastra no Cognito
2. apos confirmacao, criar `User` no AppSync e DynamoDB
3. salvar:
   - `cognitoId`
   - `name`
   - `email`
   - `role`
   - `cro`
   - `specialty`
   - `verified`

Resultado esperado:

- dashboards e regras de negocio passam a depender do `User` real
- o app deixa de usar `src/data/users.ts` como fonte principal

### 9. Migrar cadastro de consultorio

Objetivo: trocar o fluxo atual de WhatsApp por criacao real de consultorio.

Arquivo principal:

- `src/pages/RegisterConsultory.tsx`

Nova responsabilidade:

- enviar formulario para `client.models.Consultory.create(...)`

Campos minimos da primeira versao:

- nome
- bairro
- cidade
- estado
- preco por periodo
- equipamentos
- disponibilidade basica
- telefone ou WhatsApp

Resultado esperado:

- o proprietario passa a cadastrar consultorios reais
- o catalogo passa a refletir os registros criados

---

## Fase 2 - Reservas

### 10. Implementar `Booking` e `Availability`

Objetivo: sair do mock nas reservas.

Agora sim adicione ao schema:

- `Booking`
- `Availability`

Depois migre:

- `BookingModal`
- dashboards de locatario e proprietario

Fluxo da etapa:

1. usuario seleciona data e periodo
2. frontend cria `Booking`
3. dashboard mostra reservas reais
4. disponibilidade passa a bloquear datas e periodos ocupados

Resultado esperado:

- `src/data/bookings.ts` deixa de ser a fonte principal
- a reserva passa a existir de verdade

### 11. Migrar dashboards para dados reais

Objetivo: fazer os tres dashboards consumirem AppSync.

Ordem recomendada:

1. `TenantDashboard`
2. `OwnerDashboard`
3. `AdminDashboard`

O que cada um deve consumir:

- Locatario: reservas do usuario autenticado
- Proprietario: consultorios proprios e reservas recebidas
- Admin: visao consolidada de usuarios, consultorios e reservas

Resultado esperado:

- os paineis refletem dados reais do sistema
- os mocks ficam so como fallback temporario ate remocao total

---

## Fase 3 - Storage, vistoria e avaliacoes

### 12. Adicionar Storage S3

Objetivo: permitir upload real de imagens e documentos.

Adicionar no backend:

- `storage/resource.ts`

Depois migrar frontend para:

- upload de imagens de consultorio
- fotos de vistoria
- avatar
- documentos

Comandos uteis no WSL2 para rodar durante desenvolvimento:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

npx ampx sandbox
npm run dev
```

Resultado esperado:

- imagens deixam de ser apenas URLs estaticas
- o app passa a ter ativos reais no S3

### 13. Implementar `Inspection` e `Review`

Objetivo: concluir o ciclo operacional da locacao.

Adicionar ao schema:

- `Inspection`
- `Review`

Migrar:

- `InspectionModal`
- `ReviewModal`

Fluxo:

- check-in cria vistoria
- check-out atualiza status da reserva
- avaliacao cria review
- ratings comecam a ser recalculados

Resultado esperado:

- ciclo de reserva fica quase completo
- `src/data/reviews.ts` deixa de ser necessario

---

## Fase 4 - Automacoes e regras de negocio

### 14. Adicionar Lambdas de negocio

Objetivo: automatizar eventos importantes.

Ordem recomendada:

1. `confirmBooking`
2. `updateRating`
3. `sendNotification`
4. `verifyDocument`
5. `premiumScheduler`

Deixe para depois:

- `processPayment`
- `stripeWebhook`

Motivo: essas ultimas tem mais integracao externa e risco.

Resultado esperado:

- reserva pode gerar notificacao
- avaliacao pode recalcular reputacao
- admin pode aprovar usuario e documento

---

## Fase 5 - Pagamentos, admin e deploy

### 15. Integrar pagamentos por ultimo

Objetivo: fechar a V1 transacional sem travar a base antes.

Quando comecar esta fase, ai sim adicione:

- Stripe
- `Payment`
- `processPayment`
- `stripeWebhook`

Fluxo:

1. reserva criada
2. proprietario confirma
3. pagamento e iniciado
4. webhook confirma
5. reserva muda de estado

Resultado esperado:

- fluxo completo: busca -> reserva -> pagamento -> vistoria -> avaliacao

### 16. Preparar deploy e CI/CD

Objetivo: sair do sandbox e formalizar ambientes.

Itens:

- conectar repositorio no Amplify Hosting
- configurar branch `develop` e `main`
- criar `amplify.yml`
- cadastrar secrets
- validar geracao de outputs por branch

Comandos uteis:

```bash
npx ampx generate outputs
npx ampx pipeline-deploy --branch develop --app-id SEU_APP_ID
```

---

## Ordem pratica resumida

1. Preparar AWS e Node no WSL2
2. Instalar Amplify
3. Criar `amplify/backend.ts`, `auth` e `data`
4. Rodar `npx ampx sandbox`
5. Conectar `Amplify.configure(outputs)`
6. Migrar login e cadastro
7. Migrar `User` e `Consultory`
8. Migrar cadastro de consultorio
9. Adicionar `Booking` e `Availability`
10. Migrar dashboards
11. Adicionar S3
12. Migrar vistoria e avaliacoes
13. Adicionar Lambdas
14. Integrar Stripe
15. Configurar deploy

---

## Comandos base para WSL2

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

npm add -D @aws-amplify/backend @aws-amplify/backend-cli
npm add aws-amplify
npm add -D @types/aws-lambda

aws configure
aws sts get-caller-identity

npx ampx sandbox
npm run dev
npm run build
```

---

## Checklist da Fase 1

### Preparacao do ambiente

- [ ] Entrar na raiz do projeto no WSL2:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil
```

- [ ] Validar ferramentas instaladas:

```bash
node -v
npm -v
aws --version
git --version
```

- [ ] Configurar AWS CLI, se necessario:

```bash
aws configure
```

- [ ] Confirmar identidade AWS ativa:

```bash
aws sts get-caller-identity
```

### Instalacoes iniciais

- [ ] Instalar dependencias do Amplify Gen2:

```bash
npm add -D @aws-amplify/backend @aws-amplify/backend-cli
npm add aws-amplify
npm add -D @types/aws-lambda
```

- [ ] Validar que o projeto continua compilando:

```bash
npm run build
```

### Criacao inicial de arquivos

- [ ] Criar a pasta `amplify/`
- [ ] Criar o arquivo `amplify/backend.ts`
- [ ] Criar a pasta `amplify/auth/`
- [ ] Criar o arquivo `amplify/auth/resource.ts`
- [ ] Criar a pasta `amplify/data/`
- [ ] Criar o arquivo `amplify/data/resource.ts`

Estrutura alvo:

```text
amplify/
├── backend.ts
├── auth/
│   └── resource.ts
└── data/
    └── resource.ts
```

### Primeiro bootstrap do backend

- [ ] Rodar o sandbox pela primeira vez:

```bash
npx ampx sandbox
```

- [ ] Confirmar geracao do arquivo `amplify_outputs.json`
- [ ] Manter o sandbox rodando em um terminal dedicado

### Primeira conexao com o frontend

- [ ] Atualizar `src/main.tsx` para usar:
  - [ ] `import { Amplify } from "aws-amplify"`
  - [ ] `import outputs from "../amplify_outputs.json"`
  - [ ] `Amplify.configure(outputs)`

- [ ] Validar build novamente:

```bash
npm run build
```

### Escopo tecnico da Fase 1

- [ ] Implementar `auth` minimo com email e senha
- [ ] Implementar `data` minimo com `User`
- [ ] Implementar `data` minimo com `Consultory`
- [ ] Nao incluir ainda:
  - [ ] `Booking`
  - [ ] `Availability`
  - [ ] `Storage`
  - [ ] Lambdas
  - [ ] Stripe
  - [ ] SES e SNS

### Saida esperada da Fase 1

- [ ] Amplify instalado no projeto
- [ ] Backend minimo criado em `amplify/`
- [ ] Sandbox funcionando
- [ ] `amplify_outputs.json` gerado
- [ ] Frontend configurado com `Amplify.configure(outputs)`
- [ ] Projeto compilando apos a integracao inicial

