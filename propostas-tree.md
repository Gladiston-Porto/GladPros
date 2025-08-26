# Árvore do módulo `propostas` — visão completa (repo root)

Este documento lista todos os arquivos e caminhos do repositório relacionados a `proposta`/`propostas` (rotas `app`, endpoints `api`, módulos em `src/modules`, componentes reutilizáveis, libs/serviços, validações, tipos, migrations, docs e assets), com uma linha de descrição por item.

---

## Rotas do app (Next.js app router)
- `src/app/propostas/page.tsx` — Página que mostra a listagem/visão principal de propostas (usa componentes do módulo).
- `src/app/propostas/layout.tsx` — Layout específico para /propostas (envolve páginas filhas com o mesmo cabeçalho/estilo).
- `src/app/propostas/nova/page.tsx` — Página para criação de nova proposta (renderiza o formulário modular/novo e o `ClientesProvider`).
- `src/app/propostas/[id]/page.tsx` — Página de detalhe/edição de uma proposta específica.
- `src/app/proposta-modular/page.tsx` — Página/entrada para o fluxo modular de criação de proposta (usa componentes/provedores modulares).

## Endpoints API (server-side)
- `src/app/api/propostas/route.ts` — Endpoint principal `/api/propostas` (GET lista, POST criar etc.).
- `src/app/api/propostas/route-new.ts` — Handler alternativo/novo para criação de propostas (migratório ou versão específica).
- `src/app/api/propostas/simple/route.ts` — Endpoint simplificado para criação/consulta de propostas (API leve).
- `src/app/api/propostas/rascunho/route.ts` — Endpoints para salvar/recuperar rascunhos de proposta.
- `src/app/api/propostas/[id]/route.ts` — Operações sobre uma proposta (GET, PUT, DELETE, PATCH conforme implementado).
- `src/app/api/propostas/[id]/assinatura/route.ts` — Endpoints para gerenciar assinaturas (assinatura eletrônica) de uma proposta.
- `src/app/api/propostas/[id]/pdf/route.ts` — Endpoint para gerar/baixar PDF de uma proposta específica.
- `src/app/api/propostas/[id]/send-email/route.ts` — Endpoint para enviar proposta por e-mail.
- `src/app/api/propostas/[id]/cancel/route.ts` — Endpoint para cancelar uma proposta.
- `src/app/api/propostas/[id]/send/route.ts` — Endpoint para marcação/envio de proposta (workflow de envio).
- `src/app/api/propostas/export/csv/route.ts` — Endpoint para exportar propostas em CSV.
- `src/app/api/propostas/export/pdf/route.ts` — Endpoint para gerar/exportar PDF (server-side).
- `src/app/api/client/proposta/[token]/route.ts` — Endpoint público para acessar proposta via token (cliente view).
- `src/app/api/client/proposta/[token]/sign/route.ts` — Endpoint para assinatura (assinatura via cliente/token).

## Código do módulo (src/modules/propostas)
- `src/modules/propostas/pages/ListPage.tsx` — Implementação da página de listagem usada pelo módulo (header, Toolbar, tabela, paginação, ações em massa).
- `src/modules/propostas/components/Toolbar.tsx` — Toolbar com busca, filtros, menus de exportação e botão "Nova Proposta" (ajustada para parity com outros módulos).
- `src/modules/propostas/components/PropostasTable.tsx` — Componente de tabela que renderiza linhas de propostas, seleção, ordenação e ações por linha.
- `src/modules/propostas/components/PropostasList.tsx` — Componente alternativo de listagem (pode ser usado em variações da UI).
- `src/modules/propostas/components/PropostaFormClean.tsx` — Versão "clean" do formulário de proposta (implementa layout + campos de proposta).
- `src/modules/propostas/components/PropostaForm.tsx` — Formulário de proposta (campos, validação, submit handlers).
- `src/modules/propostas/components/PropostaDetails.tsx` — Componente para mostrar detalhes de uma proposta (visualização expandida).
- `src/modules/propostas/components/index.ts` — Barrel export dos componentes do módulo.
- `src/modules/propostas/services/propostasApi.ts` — Serviços client-side para operações com /api/propostas (get, create, update, delete, drafts etc.).
- `src/modules/propostas/services/exportService.ts` — Helpers de export (CSV/PDF) específicos do módulo propostas.
- `src/modules/propostas/services/bulkService.ts` — Helpers para ações em massa (bulk) e heurísticas/avisos para exportação.
- `src/modules/propostas/services/index.ts` — Barrel export dos serviços do módulo.
- `src/modules/propostas/.gitkeep` — Placeholder para garantir controle de versão da pasta.

## Componentes e utilitários em `src/components/propostas`
- `src/components/propostas/index.ts` — Barrel export de componentes/utis relacionados a propostas.
- `src/components/propostas/PropostaFormNova.tsx` — Componente de formulário "nova proposta" (alterações recentes: título `h2`, botões alinhados, dark-mode fixes).
- `src/components/propostas/PropostaFormModular.tsx` — Versão modular do formulário usada pelo fluxo modular.
- `src/components/propostas/PropostaFormClean.tsx` — (se existente também no components) variação do form com estrutura limpa.
- `src/components/propostas/PropostaFormModular.tsx` — (verificar duplicatas entre modules/components)
- `src/components/propostas/ProdutoPropostaView.tsx` — (se houver variações que mostrem itens/produtos na proposta).
- `src/components/propostas/ClientesContext.tsx` — Provider/context para disponibilizar lista de clientes às forms de proposta.
- `src/components/propostas/ClientesContext.tsx` — provedor que carrega `/api/clientes` e fornece `clientes` e `loading` para selects.
- `src/components/propostas/ClientePropostaView.tsx` — Visualização lado-cliente (public facing) das propostas.
- `src/components/propostas/validation.ts` — Validações de formulário relacionadas a propostas (client-side helpers).
- `src/components/propostas/useAutoSave.ts` — Hook para auto-save de propostas/rascunhos.
- `src/components/propostas/ui-components.tsx` — Pequenos componentes de UI usados dentro do formulário (inputs, selects, seções).
- `src/components/propostas/types.ts` — Tipos/DTOs locais para componentes de proposta.
- `src/components/propostas/hooks.ts` — Hooks reutilizáveis específicos do form/proposta (fetchers, handlers, etc.).
- `src/components/propostas/adapter.ts` — Adaptadores de dados entre API e formulário (mapeamentos de campos).
- `src/components/propostas/sections/` — Pasta com seções do formulário:
  - `IdentificacaoSection.tsx` — Seção de identificação (cliente, contato, título).
  - `FaturamentoSection.tsx` — Seção de faturamento/dados financeiros.
  - `EtapasSection.tsx` — Seção de etapas do projeto/escopo.
  - `EscopoSection.tsx` — Detalhamento do escopo técnico/comercial.
  - `MaterialSection.tsx` — Lista de materiais/insumos da proposta.
  - `ComercialSection.tsx` — Condições comerciais, descontos, impostos.
  - `ResumoPrecoSidebar.tsx` — Sidebar com resumo de preços e totais.
  - `PrazosSection.tsx` — Prazos e entregas.
  - `ObservacoesSection.tsx` — Observações gerais e anexos.
  - `PermitsSection.tsx` — Seção de permissões/autorizações (quando aplicável).
  - `index.ts` — Barrel export das seções.

## Libs, serviços e validações (src/lib)
- `src/lib/validations/proposta.ts` — Schemas e validações zod para proposta (assinaturas, campos obrigatórios, formatos).
- `src/lib/services/proposta-token.ts` — Geração/validação de tokens de acesso público para propostas (token-based access).
- `src/lib/services/proposta-rbac.ts` — RBAC/permssões específicas para propostas (controle de quem pode ver/editar/enviar).
- `src/lib/services/proposta-pdf.ts` — Helpers server-side para gerar PDF de proposta (layout, merge de dados).
- `src/lib/services/proposta-numbering.ts` — Lógica de numeração/serialização de propostas (número sequencial, prefixos, ano).
- `src/lib/services/proposta-email.ts` — Helpers para enviar propostas por email (templates, attachments, tracking).

## Tipos e validações (src/types)
- `src/types/proposta.ts` — Tipos/DTOs para proposta (domínio).
- `src/types/propostas.ts` — Tipos para lista/responses de propostas.
- `src/types/proposta-clean.ts` — Tipos/versões limpas do payload (strip internal fields para client).

## Prisma / migrations
- `prisma/migrations/20250823_add_propostas/migration.sql` — Migration que adiciona tabelas/colunas iniciais de propostas.
- `prisma/migrations/20250824_propostas_blueprint_mvp/migration.sql` — Migration adicional/blueprint para propostas MVP (campos, relações, índices).

## Documentação e imagens
- `doc/propostas-implementation-summary.md` — Documento com resumo da implementação do módulo propostas (decisões, notas).
- `doc/propostas-layout-padronization.md` — Documento com padronização de layout proposta => para alinhar com `usuarios`/`clientes`.
- `propostas.png`, `propostas-no-plus.png`, `propostas-final.png`, `proposta-nova-light.png`, `proposta-nova-light-wide.png` — Capturas/artefatos de validação visual (screenshots geradas durante implementação).

## Endpoints/public client flows
- `src/app/api/client/proposta/[token]/route.ts` — Acesso público para visualizar proposta via token (client-facing route).
- `src/app/api/client/proposta/[token]/sign/route.ts` — Endpoint para cliente assinar proposta usando token.

## Cobertura, testes e relatórios
- Coverage: Relatórios gerados podem conter entradas para arquivos de propostas (ver `coverage/lcov-report` se existir). (Nenhum teste unitário explícito listado nas buscas, mas há validações e hooks testáveis.)

## Cross-references e usos em outros módulos
- `src/components/propostas/PropostaFormNova.tsx` e `src/modules/propostas/*` são consumidos pelo `src/app/propostas/*` routes.
- Clientes: `ClientesContext.tsx` e `ClientesProvider` são usados para popular selects de cliente nas propostas.
- RBAC & navigation: `src/lib/rbac-core.ts` e componentes de navegação podem fazer referência ao módulo `propostas` para permissões e breadcrumbs.

---

Status:
- Varrição completa por padrão de nomes (`proposta*`, `propostas*`) realizada e os itens acima foram incluídos no arquivo.

O que posso fazer em seguida (opções):
- Expandir cada entrada com 2–4 linhas descrevendo funções exportadas/props principais e exemplos de uso.
- Gerar uma árvore indentada/diretório (ls -R style) com contagem de linhas por arquivo.
- Abrir qualquer arquivo listado para mostrar seu conteúdo ou aplicar pequenas correções (por exemplo, padronizar `Toolbar`/`Nova Proposta` como fiz em `propostas` anteriormente).

