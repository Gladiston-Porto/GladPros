# Árvore do módulo `usuarios`

Este arquivo lista a estrutura completa do módulo `usuarios` no projeto, incluindo componentes, páginas, rotas `app/(dashboard)` e endpoints `src/app/api/usuarios`.

---

## src/modules/usuarios/

- components/
  - RoleBadge.tsx — Exibe badge do papel/role do usuário.
  - SecurityTab.tsx — Aba de segurança: histórico de senhas, sessões, controles de segurança.
  - Toolbar.tsx — Barra de busca/filters/export utilizada na listagem de usuários.
  - UserForm.tsx — Formulário de criação/edição de usuário (campos, validação, submit).
  - UsersTable.tsx — Tabela/listagem com colunas e ações (visualizar, editar, deletar, alternar status).

- pages/
  - ListPage.tsx — Página de listagem de usuários; monta header, chama `Toolbar` e `UsersTable`, paginação.
  - NewPage.tsx — Página para criação de novo usuário; usa `UserForm`.
  - DetailPage.tsx — Página de detalhe/edição de usuário; usa `UserForm` e `SecurityTab`.

- services/
  - usersApi.ts — Cliente/serviços para operações CRUD sobre usuários (fetch/POST/PATCH/DELETE).
  - exportService.ts — Funções de export (CSV/PDF) específicas para usuários.
  - auditoriaApi.ts — Serviços para recuperar registros de auditoria relacionados a um usuário.

- types.ts — Tipos/DTOs usados pelo módulo `usuarios`.

- [id]/
  - page.tsx — Rota dinâmica para acesso a um usuário pelo id (detalhe/edição).

---

## Rotas e páginas do `app` relacionadas (Next.js app router)

- src/app/(dashboard)/usuarios/
  - page.tsx — Exporta/encapsula `UsersListPage` (usa `src/modules/usuarios/pages/ListPage.tsx`).
  - novo/
    - page.tsx — Exporta `UserNewPage` (usa `src/modules/usuarios/pages/NewPage.tsx`).
  - [id]/
    - page.tsx — Exporta `UserDetailPage` (usa `src/modules/usuarios/[id]/page.tsx` ou `modules/.../DetailPage`).

## Endpoints API relacionados (src/app/api/usuarios)

- src/app/api/usuarios/route.ts
  - Handler principal para GET /api/usuarios (listar) e POST /api/usuarios (criar).

- src/app/api/usuarios/export/csv/route.ts
  - Endpoint que gera/retorna CSV para exportação de usuários.

- src/app/api/usuarios/sessions/
  - route.ts — Endpoints para gerenciar sessões globais (/api/usuarios/sessions).
  - [sessionId]/ — Pasta com rota(s) para operações específicas de sessão (ex: DELETE /api/usuarios/sessions/[sessionId]).

- src/app/api/usuarios/[id]/route.ts
  - GET /api/usuarios/:id — obter um usuário
  - PATCH /api/usuarios/:id — atualização parcial
  - PUT /api/usuarios/:id — substituir (quando aplicável)
  - DELETE /api/usuarios/:id — remover usuário

- src/app/api/usuarios/[id]/auditoria/route.ts
  - Endpoints para recuperar auditoria/logs de um usuário específico.

- src/app/api/usuarios/[id]/security/route.ts
  - Endpoints relacionados à segurança do usuário (ex.: security info).

- src/app/api/usuarios/[id]/sessions/route.ts
  - Endpoints para listar/encerrar sessões do usuário específico.

- src/app/api/usuarios/[id]/status/route.ts
  - Endpoints para alterar/consultar status do usuário (ex.: ativar/inativar).

---

## Observações

- Algumas rotas do `app` mapeiam diretamente para os arquivos em `src/modules/usuarios/pages/*` (padrão usado no projeto para separar lógica de módulos e rotas de app).
- Há também utilitários e libs que referenciam `usuario` em outras pastas (`src/lib`, `src/types`, `src/services`) — não listei todos aqui, apenas o módulo e rotas diretamente relacionadas.

---

Se quiser, posso:
- Incluir tamanho/contagem de linhas para cada arquivo.
- Exportar essa mesma árvore em JSON.
- Abrir / copiar o conteúdo de qualquer arquivo listado (ex.: `Toolbar.tsx`, `UserForm.tsx`).

Arquivo gerado: `usuarios-tree.md` na raiz do repositório.
