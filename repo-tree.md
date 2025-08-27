# Árvore do repositório `gladpros-nextjs` (visão de alto nível)

Este arquivo apresenta uma visão em árvore da raiz do repositório, com os arquivos/pastas mais relevantes e entradas importantes dentro de `src/`. Use como ponto inicial para análise. Se quiser, eu gero uma versão `ls -R` completa ou uma versão com contagem de linhas por arquivo.

- .gitignore
- .env.example
- package.json
- package-lock.json
- next.config.ts
- next-env.d.ts
- tsconfig.json
- tsconfig.tsbuildinfo
- docker-compose.yml
- postcss.config.mjs
- eslint.config.mjs
- README.md
- README.dev.md
- components.json

- prisma/
  - schema.prisma
  - seed.js
  - seed.ts
  - migrations/
    - .gitkeep
    - 20250101_init/migration.sql
    - 20250821_auth_extras/migration.sql
    - 20250822_add_token_version/migration.sql
    - 20250823_add_propostas/migration.sql
    - 20250824_propostas_blueprint_mvp/migration.sql
    - migration_lock.toml
    - init.sql

- public/
  - file.svg
  - globe.svg
  - next.svg
  - vercel.svg
  - window.svg
  - fonts/
    - NEUROPOL.ttf
    - neuropol.otf
  - images/
    - LOGO_300.png, LOGO_200.png, LOGO 01..06.png, ICONE GLADPROS.ico, CAPA FACEBOOK.png

- scripts/  (coleção de utilitários e migrações)
  - create-auth-tables.js
  - create-audit-table.js
  - create-audit-logs-table.js
  - create-test-user.js
  - seed-smoke-user.js
  - prisma-smoke-test.js
  - many SQL helpers and JS helpers for migrations/tests

- doc/
  - 01-arquitetura.md
  - 02-logica-sistema.md
  - 03-fluxo-autenticacao.md
  - 04-estrutura-db.md
  - 05-roadmap.md
  - 06-melhorias-reset-senha.md
  - 06-relatorio-testes.md
  - 07-correcao-auditoria-seguranca.md
  - 07-revisao-completa-cliente.md
  - propostas-implementation-summary.md
  - propostas-layout-padronization.md
  - propostas-implementation-summary.md

- coverage/
  - coverage-final.json
  - clover.xml
  - lcov.info
  - lcov-report/ (HTML coverage artifacts)

- src/
  - app/ (Next.js app router pages + API routes)
    - page.tsx
    - layout.tsx
    - globals.css
    - error.tsx
    - not-found.tsx
    - api/
      - auth/ (login, forgot-password, reset-password, mfa, me, logout, unlock)
      - usuarios/ (route.ts, export/csv, export/pdf, [id]/route.ts, sessions)
      - clientes/ (route.ts, [id]/route.ts, bulk, export/csv, export/pdf)
      - propostas/ (route.ts, route-new.ts, simple/route.ts, rascunho/route.ts, [id]/route.ts, [id]/pdf, [id]/send, [id]/send-email, [id]/cancel, export/csv, export/pdf)
      - client/proposta/[token]/ (route.ts, sign/route.ts)
      - notifications/, security/reports, dev/ last-mail, debug/make-token
  - components/
    - ui/ (common UI primitives: Button, Input, Select, Table, FormContainer, Toaster, Loading)
    - GladPros/ (branding component)
    - DashboardShell.tsx
    - ModulePages.tsx
    - clientes/ (ClienteList, ClienteForm, Pagination, Filters, Card, DetailsModal)
    - propostas/ (PropostaFormNova, PropostaFormModular, ClientPropostaView, sections/*)
  - modules/
    - usuarios/ (pages: ListPage.tsx, NewPage.tsx, DetailPage.tsx; components: Toolbar.tsx, UsersTable.tsx, UserForm.tsx; services)
    - clientes/ (pages: ListPage.tsx, services, components: Toolbar.tsx, ClientesTable.tsx)
    - propostas/ (pages: ListPage.tsx; components: Toolbar.tsx, PropostasTable.tsx, PropostasList.tsx, PropostaForm.tsx, PropostaFormClean.tsx, PropostaDetails.tsx; services/)
    - dashboard/ (page, components, services)
    - projetos/, financeiro/, estoque/ (placeholders or .gitkeep)
  - lib/
    - prisma.ts, audit.ts, auditoria.ts, cache.ts, crypto.ts, email.ts, mailer.ts, env.ts, jwt.ts, rbac.ts, rbac-core.ts, requireServerUser.ts
    - services/
      - proposta-numbering.ts, proposta-pdf.ts, proposta-email.ts, proposta-token.ts, proposta-rbac.ts, notificationService.ts, emailService.ts
    - validations/ (cliente, proposta, index)
    - helpers/ (cliente helpers)
  - hooks/ (useClienteOperations, use-toast, etc.)
  - server/ (db.ts)
  - types/ (proposta.ts, propostas.ts, cliente.ts, auditoria.ts, nodemailer.d.ts)
  - tests/ and __tests__/

- Other top-level files
  - many test scripts at root: test-*.js (test-login.js, test-email.js, test-validation.js, etc.)
  - various planning and report markdowns: CLIENTE_FASE_*.md, ETAPA-*.md, RELATORIO-FASE-3.md
  - utility JS files: fix-users.js, tmp-fetch.js
  - jest.config.js, jest.setup.js

---

O que fiz:
- Gere uma visão em árvore resumida e focada nos pontos que aparecem com frequência nas buscas (rotas `app`, módulos em `src/modules`, `src/components`, `src/lib`, `prisma`, `scripts`, `doc`, `public`).

Checklist (minhas suposições e opções):
- [x] Incluir top-level files e pastas essenciais
- [x] Mapear `src/app` (rotas e API) com ênfase em `propostas`, `clientes`, `usuarios`
- [x] Listar componentes e módulos principais sob `src/`
- [ ] (opcional) Gerar `ls -R` completo e salvar como `repo-tree-full.txt` — pedir confirmação
- [ ] (opcional) Expandir cada arquivo com 1–3 linhas descrevendo exports/métodos — pedir confirmação

Próximo: quer que eu gere a lista completa recursiva (`ls -R`) para download, ou prefira uma versão expandida com descrições por arquivo focando apenas em `propostas`/`clientes`/`usuarios`?  
