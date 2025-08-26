# Árvore do fluxo de autenticação / módulo `login`

Este arquivo lista a estrutura completa das páginas públicas relacionadas ao login e dos endpoints de autenticação em `src/app/api/auth`, além dos utilitários `src/lib` usados por esse fluxo.

---

## Páginas públicas (rotas em `src/app`)

- `src/app/login/page.tsx` — Página de login pública; formulário de e-mail e senha, validação básica, tratamento de contas bloqueadas (mostra contagem regressiva), redireciona para MFA (`/mfa`) quando necessário e fornece links para esqueci senha e desbloqueio.
- `src/app/mfa/page.tsx` — Página de verificação MFA (código de 6 dígitos); possui lógica de auto-submit quando todos os dígitos são preenchidos, timer de expiração e botão para reenviar código.
- `src/app/esqueci-senha/page.tsx` — Página que solicita o e-mail do usuário para gerar token de reset; chama `/api/auth/forgot-password` e exibe mensagem genérica de sucesso.
- `src/app/reset-senha/[token]/page.tsx` — Página para redefinir a senha usando token por e-mail; valida critérios de senha, mostra barra de força e chama `/api/auth/reset-password`.
- `src/app/primeiro-acesso/page.tsx` — Fluxo guiado para primeiro acesso (definir senha, criar PIN, configurar pergunta de segurança e confirmar); enviado para `/api/auth/first-access/setup`.
- `src/app/desbloqueio/page.tsx` — Página para desbloquear contas bloqueadas; etapa de identificação por e-mail, método de desbloqueio por PIN ou pergunta de segurança, chama `/api/auth/user-status` e `/api/auth/unlock`.

## Endpoints API (src/app/api/auth)

- `src/app/api/auth/login/route.ts` — POST /api/auth/login: valida credenciais, aplica rate-limiting, checa bloqueios, cria código MFA e inicia fluxo de verificação; retorna objeto indicando `mfaRequired` e dados do usuário.
- `src/app/api/auth/forgot-password/route.ts` — POST /api/auth/forgot-password: gera token de reset, grava `PasswordResetToken`, envia e-mail (responde 200 mesmo que o e-mail não exista para evitar enumeração).
- `src/app/api/auth/reset-password/route.ts` — POST /api/auth/reset-password: valida token e redefine senha (marca token como usado).
- `src/app/api/auth/mfa/request/route.ts` — POST /api/auth/mfa/request: gera/enviar código MFA por email (usado para solicitar código sem passar pelo login completo).
- `src/app/api/auth/mfa/verify/route.ts` — POST /api/auth/mfa/verify: verifica código MFA; em caso de sucesso gera JWT (usa `signAuthJWT`), cria sessão ativa, atualiza `ultimoLoginEm`, limpa tentativas falhas e seta cookie `authToken` (e `sessionToken` quando aplicável).
- `src/app/api/auth/mfa/resend/route.ts` — POST /api/auth/mfa/resend: reenvio de código MFA com rate-limiting.
- `src/app/api/auth/unlock/route.ts` — POST /api/auth/unlock: endpoint que trata desbloqueio via PIN ou pergunta de segurança.
- `src/app/api/auth/logout/route.ts` — POST /api/auth/logout: encerra sessão e remove cookies relacionados.
- `src/app/api/auth/me/route.ts` — GET /api/auth/me: retorna informações do usuário autenticado (quando houver cookie JWT válido).
- `src/app/api/auth/user-status/route.ts` — POST /api/auth/user-status: consulta se conta está bloqueada e métodos de desbloqueio disponíveis (usado pela página `/desbloqueio`).
- `src/app/api/auth/first-access/setup/route.ts` — POST /api/auth/first-access/setup: finaliza configuração de primeiro acesso (nova senha, PIN, pergunta de segurança).

## Utilitários `src/lib` relacionados ao fluxo de autenticação

- `src/lib/blocking.ts` — Lógica e helpers para registrar tentativas de login falhas, verificar bloqueios, determinar `unlockAt`, e limpar falhas após sucesso.
- `src/lib/mfa.ts` — Serviço responsável por criar/verificar códigos MFA, TTL e geração de códigos.
- `src/lib/rate-limit.ts` — Implementação de rate limiting usada em endpoints de login/MFA.
- `src/lib/audit.ts` e `src/lib/auditoria.ts` — Sistema de auditoria para registrar eventos (LOGIN, LOGOUT, LOGIN_ATTEMPT, etc.).
- `src/lib/email.ts` e `src/lib/emails/*` — Serviços e templates para envio de e-mails (MFA, reset de senha, bem-vindo).
- `src/lib/password.ts` e `src/lib/passwords.ts` — Funções de validação e hashing de senha (regras de força/validação exibidas em `reset-senha` e `primeiro-acesso`).
- `src/lib/jwt.ts` — Funções para assinar/verificar JWTs de autenticação (`signAuthJWT`).
- `src/lib/tokens.ts` — Helpers para geração/sha256 de tokens usados em reset-senha.
- `src/lib/security.ts` — Criação de sessões ativas, gerenciamento e funções auxiliares relacionadas à segurança da sessão.
- `src/lib/rbac.ts` / `src/lib/rbac-core.ts` — Regras de autorização usadas após autenticação.

## Rotas públicas relacionadas (mapeamento `src/app`)

- `/login` → `src/app/login/page.tsx`
- `/mfa` → `src/app/mfa/page.tsx`
- `/esqueci-senha` → `src/app/esqueci-senha/page.tsx`
- `/reset-senha/[token]` → `src/app/reset-senha/[token]/page.tsx`
- `/primeiro-acesso` → `src/app/primeiro-acesso/page.tsx` (e `/primeiro-acesso/resetar-senha`)
- `/desbloqueio` → `src/app/desbloqueio/page.tsx`

---

## Observações

- Esta árvore cobre as páginas de autenticação e os endpoints que controlam o fluxo de login/MFA/reset/desbloqueio; existem também testes e scripts em `src/tests` que exercitam esses fluxos (`test-login-flow.js`, `test-auth-flow.js`, etc.).
- Se deseja exatamente o mesmo nível de detalhe do `usuarios-tree.md` (lista de cada arquivo, rota `app/(dashboard)` e todos os endpoints `src/app/api/auth` com descrições linha-a-linha), diga e eu vou enumerar cada arquivo individualmente e incluir snippets de propósito como no arquivo `usuarios-tree.md`.

---

Se quer, eu já gero uma versão completa em formato Markdown que lista todos os arquivos com 1 linha cada (como `usuarios-tree.md`) — diga "completo" que eu gero e salvo `login-tree.md` substituindo este resumo.
