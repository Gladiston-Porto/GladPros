# Árvore do módulo `clientes` — visão completa (repo root)

Este arquivo lista todos os arquivos e caminhos relacionados ao módulo `clientes` encontrados no repositório (rotas app, APIs, módulo em src/modules, componentes reutilizáveis, hooks, testes e artefatos de coverage), com uma linha de descrição por item.

## Rotas do aplicativo (Next.js app router)
- `src/app/clientes/page.tsx` — Página que monta a listagem de clientes (renderiza componentes do módulo: ListPage/Toolbar/Panel).
- `src/app/clientes/layout.tsx` — Layout específico do caminho /clientes (envolve páginas filhas com o mesmo layout).
- `src/app/clientes/novo/page.tsx` — Página para criar um novo cliente (renderiza formulário e lógica de criação).
- `src/app/clientes/[id]/page.tsx` — Página de detalhe/edição de cliente (visualização e edição de um cliente existente).

## Endpoints API (server-side)
- `src/app/api/clientes/route.ts` — Endpoint principal /api/clientes (GET lista, POST criar).
- `src/app/api/clientes/[id]/route.ts` — Endpoint para operações em um cliente (GET, PUT, DELETE).
- `src/app/api/clientes/[id]/audit/route.ts` — Endpoint para auditoria / histórico de alterações do cliente.
- `src/app/api/clientes/bulk/route.ts` — Endpoint para operações em massa (bulk activate/deactivate/delete etc.).
- `src/app/api/clientes/export/csv/route.ts` — Endpoint para exportação CSV server-side.
- `src/app/api/clientes/export/pdf/route.ts` — Endpoint para geração/baixar PDF server-side.

## Código do módulo (src/modules/clientes)
- `src/modules/clientes/pages/ListPage.tsx` — Implementação canonical da listagem (fetch, paginação, ações em massa e integração com Toolbar/ClientesTable).
- `src/modules/clientes/components/Toolbar.tsx` — Barra de ferramentas com busca, filtros (tipo/status), menu de exportação e botão "Novo Cliente".
- `src/modules/clientes/components/ClientesTable.tsx` — Tabela que renderiza linhas de clientes com seleção, ordenação e ações (Editar/Ativar/Desativar/Excluir) e rodapé de ações em massa.
- `src/modules/clientes/components/index.ts` — Barrel export do módulo de componentes.
- `src/modules/clientes/services/clientesApi.ts` — Helpers client-side que chamam os endpoints /api/clientes (getClientes, getClienteById, toggleClienteStatus, delete etc.).
- `src/modules/clientes/services/createCliente.ts` — Serviço utilitário para criação de cliente (validações/ajustes antes de POST).
- `src/modules/clientes/services/exportService.ts` — Funções para exportar clientes (CSV local, CSV server-side, PDF).
- `src/modules/clientes/services/bulkService.ts` — Lógicas de verificação/avisos para exportações em massa e helpers para bulk actions.
- `src/modules/clientes/services/index.ts` — Barrel export dos serviços do módulo.
- `src/modules/clientes/.gitkeep` — Arquivo placeholder no módulo.

## Componentes reutilizáveis em `src/components/clientes`
- `src/components/clientes/ClienteForm.tsx` — Formulário reutilizável para criação/edição de cliente.
- `src/components/clientes/ClienteList.tsx` — Componente de mais alto nível que compõe tabela e list behaviors (usado em páginas e variações).
- `src/components/clientes/ClienteFilters.tsx` — Controles de filtro (busca, tipo, status) reutilizáveis.
- `src/components/clientes/ClienteDetailsModal.tsx` — Modal para exibir detalhes rápidos do cliente.
- `src/components/clientes/ClienteCard.tsx` — Card visual para uso em dashboards ou listagens alternativas.
- `src/components/clientes/Pagination.tsx` — Componente de paginação usado pelo módulo.

## Hooks e helpers
- `src/hooks/useClienteOperations.ts` — Hook que encapsula operações CRUD/optimistic updates para clientes.

## Testes
- `src/__tests__/api/clientes/route.test.ts` — Testes unitários das rotas de API de clientes (GET/POST/validações).
- `src/__tests__/components/clientes/ClienteCard.test.tsx` — Teste de componente ClienteCard.
- `src/__tests__/hooks/useClienteOperations.test.ts` — Testes para o hook useClienteOperations (mocks fetch e asserts).

## Referências cruzadas e usos fora do módulo
- `src/components/propostas/PropostaFormNova.tsx` — Usa lista/ctx de clientes para preencher selects no formulário de proposta.
- `src/modules/propostas/components/PropostasList.tsx`, `PropostaForm.tsx`, `PropostaFormClean.tsx` — Vários componentes de propostas fazem fetchs de `/api/clientes` para preencher selects/labels.
- `src/app/proposta-modular/page.tsx` — Envolve fluxos modulares de proposta com `ClientesProvider`.
- `src/app/propostas/nova/page.tsx` — Ainda referencia `ClientesProvider` para acesso à lista de clientes nas propostas.
- `src/app/not-found-content.tsx` — Contém um botão/rota que redireciona para `/clientes` em alguns fluxos.
- `src/modules/usuarios/pages/DetailPage.tsx` — Lógica de permissões e mapeamentos que referenciam o módulo `clientes`.
- `src/lib/rbac-core.ts` — RBAC inclui "clientes" como ModuleKey para controle de permissões.

## Documentação e artefatos
- `CLIENTE_FASE_2_COMPLETE.md` — Documentação/relatório de trabalho relacionado ao módulo clientes (fases e observações de implementação).
- `coverage/lcov-report/app/api/clientes/route.ts.html` e outros arquivos sob `coverage/lcov-report/components/clientes` — Relatórios de cobertura gerados que incluem endpoints e componentes de clientes.

---
Status da verificação:
- Varrição completa do repositório (paths) realizada e itens acima incluídos.

Próximos passos sugeridos (opcional):
- Expandir cada entrada com 2–3 linhas descrevendo funções exportadas e props principais.
- Gerar uma árvore em formato de diretório (indentada) se preferir visual compacta.
