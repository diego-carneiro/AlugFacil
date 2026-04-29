# AWS Setup Status

Data de referencia: 2026-04-22

## Objetivo deste documento

Registrar o estado atual da integracao com AWS para que fique claro o que ja foi preparado localmente e o que ainda depende de credenciais e configuracao da conta AWS.

## Estado atual

- O projeto ja possui dependencias locais do Amplify instaladas no `package.json`.
- A estrutura inicial do backend ja existe em `amplify/` com:
  - `amplify/backend.ts`
  - `amplify/auth/resource.ts`
  - `amplify/data/resource.ts`
- O frontend ja foi preparado para ler `amplify_outputs.json`.
- Existe um `amplify_outputs.json` placeholder local com `{}` apenas para manter o projeto compilando antes do sandbox real.

## Mocks e funcoes locais de teste

- Neste momento, o projeto ainda possui mocks e funcoes locais de teste para permitir desenvolvimento sem backend AWS ativo.
- Esses mocks existem apenas para:
  - popular a interface
  - validar navegacao e UX
  - testar fluxos locais enquanto o sandbox real ainda nao existe
- Esses mocks e funcoes locais nao devem permanecer como fonte de verdade quando o Amplify estiver integrado corretamente.
- Assim que Cognito, AppSync, DynamoDB, S3 e demais recursos estiverem ativos, o comportamento final deve migrar para AWS como fonte primaria de autenticacao, dados, arquivos e automacoes.

## O que ainda NAO foi concluido

- AWS CLI ainda nao foi configurado com credenciais validas neste ambiente.
- O processo de `aws configure` foi interrompido antes de informar:
  - `AWS Access Key ID`
  - `AWS Secret Access Key`
  - `Default region`
  - `Default output format`
- O backend ainda nao foi criado na AWS.
- O comando `npx ampx sandbox` ainda nao foi executado com sucesso.
- O arquivo `amplify_outputs.json` ainda nao contem valores reais de Cognito, AppSync, S3 ou outros recursos.

## Ponto exato em que as credenciais passam a ser obrigatorias

As credenciais AWS ainda NAO sao obrigatorias para:

- instalar dependencias npm do Amplify
- criar a pasta `amplify/`
- criar `backend.ts`, `auth/resource.ts` e `data/resource.ts`
- preparar o frontend para `Amplify.configure(outputs)`
- evoluir o `AuthContext` localmente

As credenciais AWS passam a ser obrigatorias para:

- rodar `aws configure`
- validar identidade com `aws sts get-caller-identity`
- subir o ambiente com `npx ampx sandbox`
- gerar `amplify_outputs.json` real
- testar autenticacao Cognito de verdade
- conectar AppSync e DynamoDB reais

## Proximo passo quando as credenciais estiverem disponiveis

Executar no WSL2:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

aws configure
aws sts get-caller-identity
npx ampx sandbox
```

Depois disso, o `amplify_outputs.json` placeholder deve ser substituido pelos valores reais gerados pelo sandbox.

## Decisao atual do projeto

Enquanto as credenciais AWS nao estiverem configuradas, a Fase 1 segue em modo local:

- preparar infraestrutura code-first
- adaptar `AuthContext`
- manter fluxo demo funcional
- manter mocks pequenos apenas para testes e populacao inicial da interface
- deixar o app pronto para trocar de mock para Cognito assim que o sandbox existir
