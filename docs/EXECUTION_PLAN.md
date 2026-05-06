# Plano de Execucao - AlugFacil

## Objetivo

Migrar o AlugFacil de um frontend com estado mockado para uma aplicacao fullstack com AWS Amplify Gen2, mantendo o app utilizavel durante a transicao e reduzindo retrabalho.

## Status atual do projeto

Data de atualizacao: 2026-04-30

- Fase 1 de instalacao e fundacao AWS concluida
- AWS CLI configurado e sandbox Amplify ativo
- `amplify_outputs.json` real em uso no projeto
- backend inicial (`auth` + `data` com `User` e `Consultory`) validado
- etapa 8 concluida: persistencia do perfil `User` no AppSync/Dynamo
- etapa 9 concluida: cadastro de consultorio com criacao real em AWS
- etapa 10 concluida: schema e fluxo real de reservas (`Booking` e `Availability`)
- etapa 11 concluida: dashboards migrados para consumo de dados reais
- mocks de dados removidos do frontend (`src/data/*`) e arquivo de migracao de mocks removido
- fase 3 em andamento: `storage` adicionado, `Inspection`/`Review` ativos e upload real de imagens iniciado no frontend

## Estrategia Geral

A migracao deve acontecer em 5 fases, preservando o frontend atual enquanto os mocks sao substituidos por backend real. A ordem recomendada e:

1. Infraestrutura e autenticacao
2. Dados principais
3. Reservas
4. Storage, vistoria e avaliacoes
5. Pagamentos, admin e automacoes finais

## Principio de integracao

A aplicacao deve ficar tecnicamente pronta para consumir uma `User Pool` do Cognito e os demais servicos do Amplify desde o inicio da integracao.

Ao mesmo tempo, durante o desenvolvimento inicial, podemos manter alguns mocks pequenos e controlados apenas para:

- popular a interface
- validar fluxos visuais
- permitir testes locais antes do sandbox AWS estar disponivel

Esses mocks nao devem ser a arquitetura final da aplicacao. Eles existem apenas como apoio temporario de desenvolvimento e devem ser substituidos progressivamente conforme os servicos reais da AWS forem ativados.

---

## Arquitetura de Dominio — Perfis e Identidades

Esta secao estabelece uma decisao de arquitetura fundamental que deve ser respeitada em todas as fases de desenvolvimento, desde o schema do banco ate a UI.

### Separacao entre Usuario e Consultorio

`User` e `Consultory` sao entidades distintas no banco de dados. A confusao entre elas deve ser evitada em modelos, rotas, permissoes e componentes visuais.

| Entidade | Tabela | Perfil publico | Avaliacoes | Rota |
|---|---|---|---|---|
| Dentista (locatario) | `User` | Sim | No `User` | `/profile`, `/:username` |
| Proprietario | `User` | Nao | Nao se aplica | Sem tela de perfil proprio |
| Consultorio | `Consultory` | Sim | No `Consultory` | `/consultorios/:id` |

### Regras de dominio de perfil

- **Locatarios (dentistas)** possuem perfil publico navegavel. Avaliacoes, especialidade e CRO sao atributos do `User`.
- **Proprietarios nao possuem tela de perfil proprio**. Todos os dados publicos (descricao, disponibilidade, fotos, avaliacoes) pertencem ao `Consultory` que representam. O nome do proprietario e exibido na tela do consultorio, mas ele nao tem pagina propria.
- **Consultorios** possuem tela de detalhe propria com horarios disponveis, equipamentos, fotos, avaliacoes e nome do proprietario vinculado.
- A relacao de dominio e de **posse**: um `User` com role `owner` possui (`hasMany`) um ou mais `Consultory`. O proprietario existe como entidade de autenticacao e controle, mas sua identidade publica e o consultorio.

### Rotas de perfil — definicao canonica

- `/profile` — perfil do usuario autenticado (sempre o proprio usuario logado, apenas dentistas/admins tem perfil util)
- `/:username` — perfil publico de outro usuario (locatario/dentista); proprietarios nao possuem rota de perfil
- `/consultorios/:id` — tela de perfil de um consultorio (nao de um usuario)

A tela `/:username` e destinada apenas a dentistas. Quando proprietarios tentarem acessar um perfil publico, devem ser redirecionados ou ver uma mensagem adequada, pois seu perfil publico e o consultorio.

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
- mocks pequenos para testes locais enquanto a AWS ainda nao estiver operacional

Resultado esperado:

- o login deixa de depender de usuarios hardcoded
- o cadastro fica pronto para criar usuarios reais no Cognito

Importante para o fluxo de confirmacao por email:

- durante o desenvolvimento, sera criada uma identidade de email no Amazon SES para testes rapidos do remetente
- essa identidade de email atende o ambiente de desenvolvimento e validacoes locais, mas nao deve ser tratada como configuracao final de producao
- em producao, o correto sera substituir essa estrategia por uma identidade de dominio verificada no SES
- essa troca deve entrar no fechamento do projeto antes do go-live para evitar risco operacional, baixa entregabilidade e dependencia de remetente individual

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

Dependencia importante:

- sem `aws configure`, `ampx sandbox` e `amplify_outputs.json` real, essa camada ainda operara com fallback local
- portanto, a estrutura da Fase 2 pode ser preparada antes, mas o consumo realmente real depende da conclusao cloud da Fase 1

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

Status em 2026-04-29:

- concluida
- formulario conectado a criacao real de `Consultory` via AppSync
- fluxo de WhatsApp removido da fonte principal

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

Status em 2026-04-29:

- concluida
- models `Booking` e `Availability` adicionados ao schema
- criacao de reserva real conectada ao `BookingModal`
- bloqueio de disponibilidade conectado ao fluxo de reserva
- `src/data/bookings.ts` removido

Pre-condicao:

- a aplicacao precisa estar conectada a recursos reais do Amplify
- sem isso, a Fase 2 avanca apenas em preparacao estrutural, nao em consumo real de dados

Status desta pre-condicao em 2026-04-29:

- atendida (sandbox e outputs reais ativos)

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

Status em 2026-04-29:

- concluida
- `TenantDashboard`, `OwnerDashboard` e `AdminDashboard` consumindo camadas `src/lib/api/*`

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

Status em 2026-04-30:

- backend `storage/resource.ts` criado e conectado ao `backend.ts`
- upload de imagens no cadastro de consultorio implementado (salvando `imageKeys`)
- upload de fotos no `InspectionModal` implementado (salvando `photoKeys`)

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

Status em 2026-04-30:

- models `Inspection` e `Review` adicionados ao schema
- `InspectionModal` e `ReviewModal` migrados para gravacao real
- dashboards atualizando dados apos submissao
- detalhe de consultorio lendo avaliacoes reais

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
- configurar o Cognito para envio de email com Amazon SES no ambiente final
- revisar identidade de remetente usada durante o desenvolvimento
- trocar identidade de email por identidade de dominio antes da entrada em producao
- validar se a conta Amazon SES saiu do sandbox
- validar SPF, DKIM e, se aplicavel, DMARC do dominio de envio
- revisar endereco `from` definitivo do produto (ex.: `no-reply@seudominio.com`)

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

## Proximos passos naturais (a partir de 2026-04-30)

1. Publicar o estado atual da Fase 3 no sandbox e validar o deploy do schema (`imageKeys`, `Inspection`, `Review`) + Storage.
2. Executar validacao ponta a ponta: reserva -> vistoria (com fotos) -> avaliacao -> reflexo nos dashboards.
3. Implementar atualizacao de metricas de reputacao (`rating` e `totalReviews`) apos novas avaliacoes.
4. Migrar upload de avatar/documentos para S3, concluindo o escopo de storage da fase.
5. Tela de perfil do dentista (`/profile`) implementada (2026-05-06): exibe dados do usuario autenticado no estilo rede social. A rota `/:username` esta estruturada para exibir perfis de outros usuarios, mas depende da implementacao de lookup por username no AppSync (campo `username` no model `User` + query dedicada) para ser plenamente funcional.
6. Adicionar campo `username` unico ao model `User` para viabilizar lookup por `/:username` e garantir URLs de perfil amigaveis para dentistas.

---

## Mudancas obrigatorias para producao

Esta secao deve ser tratada como checklist de corte final. O projeto pode funcionar em desenvolvimento antes disso, mas nao deve entrar em producao sem aplicar estes ajustes.

### Email transacional e Cognito

- durante o desenvolvimento, o fluxo podera operar sem exigencia de codigo de verificacao por email, com auto-confirmacao temporaria no Cognito para acelerar testes do produto
- durante o desenvolvimento, sera aceita a criacao de uma identidade de email no Amazon SES para destravar testes do fluxo de confirmacao
- essa identidade de email e apenas um passo temporario de desenvolvimento
- antes da producao, a auto-confirmacao temporaria deve ser removida
- antes da producao, a verificacao de cadastro por codigo enviado por email deve voltar a ser obrigatoria
- antes da producao, deve ser criada e validada uma identidade de dominio no Amazon SES
- o Cognito deve ser configurado para enviar emails usando Amazon SES com o dominio oficial do produto
- o endereco de envio final deve sair de remetente pessoal ou tecnico provisiorio e migrar para algo institucional (ex.: `no-reply@seudominio.com`)
- SPF e DKIM do dominio devem estar validados
- DMARC deve ser considerado na configuracao final do dominio para aumentar entregabilidade e governanca
- a conta Amazon SES deve estar fora do sandbox antes do go-live

### Seguranca e operacao

- revisar secrets e variaveis por ambiente (`develop`, `staging`, `main` ou `production`)
- revisar politicas de autorizacao e grupos do Cognito antes da abertura publica
- revisar regras de acesso ao S3 para uploads e leitura de arquivos
- revisar mensagens padrao do Cognito para garantir linguagem e identidade da marca

### Infraestrutura e deploy

- gerar `amplify_outputs.json` por ambiente real de deploy, sem depender de artefato local de sandbox
- validar pipeline de deploy por branch
- confirmar que os recursos AWS usados em desenvolvimento nao ficaram acoplados ao ambiente de producao por acidente
- revisar regioes de Cognito, SES, S3 e AppSync para evitar configuracoes cruzadas

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

## Checklist historico da Fase 1 (concluida)

Este bloco fica apenas como registro da implantacao inicial.

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
