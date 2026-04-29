# Mock Migration Status

Data de referencia: 2026-04-22

## O que ja saiu da dependencia direta de mock

- Autenticacao e sessao passam pelo `AuthContext`.
- Leitura de usuarios passa por `src/lib/api/users.ts`.
- Leitura de consultorios passa por `src/lib/api/consultories.ts`.
- Tipos de usuario foram movidos para `src/types/user.ts`.
- Configuracoes de contato foram movidas para `src/config/contact.ts`.

## O que ainda usa mock de forma intencional

Fase 1:
- `src/lib/api/users.ts` usa `src/data/users.ts` apenas como fallback.
- `src/lib/api/consultories.ts` usa `src/data/consultories.ts` apenas como fallback.

Fase 2:
- `src/data/bookings.ts` ainda sustenta dashboards e modais de reserva.

Fase 3:
- `src/data/reviews.ts` ainda sustenta avaliacoes no detalhe do consultorio.

## Regra atual

Quando existir uma camada equivalente em `src/lib/api/`, telas e contextos nao devem importar mocks diretamente.
