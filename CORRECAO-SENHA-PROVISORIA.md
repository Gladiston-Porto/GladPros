# CORREÇÃO DO FLUXO DE LOGIN - SENHA PROVISÓRIA

## Problema Identificado
Quando um usuário era criado com senha provisória, o sistema não estava marcando corretamente os campos `primeiroAcesso` e `senhaProvisoria`, fazendo com que ele fosse direto para o dashboard em vez de seguir o fluxo de primeiro acesso.

## Correção Implementada

### 1. API de Criação de Usuários (`src/app/api/usuarios/route.ts`)
**Linha adicionada (cerca da linha 310):**
```typescript
// Campos para controle de primeiro acesso e senha provisória
if (cols.has("primeiroAcesso")) { insertCols.push("primeiroAcesso"); values.push(true); }
if (cols.has("senhaProvisoria")) { insertCols.push("senhaProvisoria"); values.push(true); }
```

### 2. Fluxo Correto Esperado

#### Quando um usuário é criado:
1. ✅ Sistema gera senha aleatória
2. ✅ Envia email com senha provisória
3. ✅ Marca `primeiroAcesso = true` 
4. ✅ Marca `senhaProvisoria = true`

#### Quando usuário faz primeiro login:
1. **Login API** (`/api/auth/login`):
   - ✅ Valida email/senha
   - ✅ Detecta `primeiroAcesso = true`
   - ✅ Retorna `mfaRequired: true` e `nextStep: "primeiro-acesso"`

2. **Frontend** redireciona para `/mfa` com parâmetros

3. **Página MFA** (`/mfa`):
   - ✅ Envia código MFA por email
   - ✅ Usuário insere código de 6 dígitos
   - ✅ Chama `/api/auth/mfa/verify`

4. **MFA Verify API** (`/api/auth/mfa/verify`):
   - ✅ Valida código MFA
   - ✅ Detecta `primeiroAcesso = true`
   - ✅ Retorna `requiresSetup: true` e `redirectUrl: "/primeiro-acesso"`

5. **Frontend** redireciona para `/primeiro-acesso`

6. **Página Primeiro Acesso** (`/primeiro-acesso`):
   - ✅ Força usuário a alterar senha
   - ✅ Pode configurar outros dados
   - ✅ Marca `primeiroAcesso = false` e `senhaProvisoria = false`
   - ✅ Só então redireciona para dashboard

## Status da Correção
- ✅ **Código corrigido** - Novos usuários terão o fluxo correto
- ⚠️ **Usuários existentes** - Já foram verificados e estão com campos corretos
- 🧪 **Teste necessário** - Precisa testar manualmente no navegador

## Para Testar:
1. Acesse: http://localhost:3000/login
2. Use email: gladiston.porto@gladpros.com
3. Use a senha provisória que foi enviada por email
4. Verifique se passa por: Login → MFA → Primeiro Acesso → Dashboard

## Arquivos Alterados:
- `src/app/api/usuarios/route.ts` - Adiciona campos primeiroAcesso e senhaProvisoria
- `fix-users.js` - Script para verificar usuários existentes (pode deletar)
