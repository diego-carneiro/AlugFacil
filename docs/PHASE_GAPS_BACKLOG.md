# Backlog de Gaps Tecnicos

Data de registro: 2026-04-29

## Contexto

Este arquivo lista gaps identificados durante a validacao da transicao entre Fase 1 e Fase 2.

## Gaps pendentes

1. Falta fluxo de confirmacao de cadastro na interface
- O projeto possui `confirmRegistration` no contexto de autenticacao, mas nao existe tela/fluxo claro para o usuario informar o codigo recebido por email.
- Impacto: usuarios podem ficar nao confirmados no Cognito e sem acesso ao login.

2. Falta persistencia do perfil `User` no AppSync/Dynamo apos confirmacao
- O cadastro cria usuario no Cognito (`signUp`), porem nao foi implementado o `client.models.User.create(...)` no fluxo de confirmacao.
- Impacto: regras de negocio que dependem do model `User` podem ficar inconsistentes.

3. Regra de senha da UI esta desalinhada com a User Pool
- A UI aceita senha com minimo de 6 caracteres, enquanto a User Pool exige minimo de 8.
- Impacto: tentativa de cadastro pode falhar somente na etapa de envio, gerando erro evitavel para o usuario.

