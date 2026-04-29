# Checklist de Encerramento da Fase 1

Data de referencia: 2026-04-22

## Objetivo

Definir criterios objetivos para considerar a Fase 1 encerrada e liberar a entrada na Fase 2.

## Regra de pronto

A Fase 1 so deve ser considerada concluida quando:

- autenticacao estiver conectada ao Cognito de forma real
- `User` e `Consultory` estiverem operando via AWS
- o frontend estiver consumindo `amplify_outputs.json` real
- os mocks restantes da Fase 1 estiverem apenas como apoio controlado de desenvolvimento, nunca como fonte primaria

---

## Bloco 1 - Infraestrutura AWS

- [ ] AWS CLI instalado e disponivel no WSL2
- [ ] `aws configure` executado com credenciais validas
- [ ] `aws sts get-caller-identity` executado com sucesso
- [ ] `npx ampx sandbox` executado com sucesso
- [ ] `amplify_outputs.json` real gerado pelo sandbox
- [ ] `amplify_outputs.json` placeholder substituido pelos valores reais

Comandos esperados:

```bash
cd /home/diego-wsl/Projetos/AlugFacil/alugfacil

aws --version
aws configure
aws sts get-caller-identity
npx ampx sandbox
```

---

## Bloco 2 - Auth real

- [ ] `src/main.tsx` configurado com `Amplify.configure(outputs)`
- [ ] `AuthContext` usando Cognito como fonte de verdade quando houver outputs reais
- [ ] cadastro real via `signUp`
- [ ] confirmacao real via `confirmSignUp`
- [ ] login real via `signIn`
- [ ] logout real via `signOut`
- [ ] hidratação de sessao real via Cognito
- [ ] sessao local funcionando apenas como espelho/cache da sessao Cognito

Resultado esperado:

- o usuario nasce no Cognito
- logout informa o Cognito e limpa o estado local
- nao existe usuario real persistido apenas localmente como fonte primaria

---

## Bloco 3 - Dados reais minimos

- [ ] backend `auth` criado e aceito pelo sandbox
- [ ] backend `data` criado e aceito pelo sandbox
- [ ] schema com `User` validado no Amplify
- [ ] schema com `Consultory` validado no Amplify
- [ ] `src/lib/api/users.ts` pronto para consumir AppSync
- [ ] `src/lib/api/consultories.ts` pronto para consumir AppSync
- [ ] listagem de consultorios vindo da camada `src/lib/api/consultories.ts`
- [ ] detalhe de consultorio vindo da camada `src/lib/api/consultories.ts`
- [ ] leitura de usuarios vindo da camada `src/lib/api/users.ts`

Resultado esperado:

- `User` e `Consultory` operam pela AWS quando o backend estiver ativo
- fallbacks locais existem apenas como apoio temporario

---

## Bloco 4 - Estado do frontend

- [ ] build de producao executa com sucesso
- [ ] login demo continua funcional para testes locais controlados
- [ ] fluxo de cadastro continua funcional no modo local de desenvolvimento
- [ ] telas publicas nao dependem mais diretamente do mock de consultorios como fonte primaria
- [ ] autenticacao nao depende mais diretamente do mock de usuarios como fonte primaria
- [ ] admin nao depende mais diretamente do mock de usuarios como fonte primaria

Comando esperado:

```bash
npm run build
```

---

## Bloco 5 - Documentacao

- [ ] `docs/AWS_SETUP_STATUS.md` atualizado com estado real das credenciais e do sandbox
- [ ] `docs/EXECUTION_PLAN.md` alinhado com a estrategia atual
- [ ] `docs/MOCK_MIGRATION_STATUS.md` atualizado com os mocks restantes
- [ ] este checklist revisado ao final da Fase 1

---

## Criterio final de entrada na Fase 2

A Fase 2 pode comecar quando todos os itens abaixo forem verdadeiros:

- [ ] Cognito ativo e validado
- [ ] AppSync e DynamoDB ativos para `User` e `Consultory`
- [ ] `amplify_outputs.json` real em uso
- [ ] frontend autenticando e lendo dados minimos reais
- [ ] mocks da Fase 1 reduzidos a apoio de desenvolvimento apenas

Quando isso acontecer, a Fase 2 passa a ser:

- adicionar `Booking` e `Availability`
- criar `src/lib/api/bookings.ts`
- conectar `BookingModal`
- migrar `TenantDashboard`
- migrar `OwnerDashboard`
- trocar reservas mockadas por reservas reais
