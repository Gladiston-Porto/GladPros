#!/usr/bin/env node
/**
 * Script to fix isBuildTime() functions in API routes
 * This corrects the logic that was causing 503 errors during tests
 */

const fs = require('fs');
const path = require('path');

const OLD_BUILD_TIME_FUNCTION = `function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
    ) &&
    process.env.NODE_ENV !== 'test'
  );
}`;

const NEW_BUILD_TIME_FUNCTION = `function isBuildTime(): boolean {
  // Nunca considerar build time durante testes
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
    )
  );
}`;

// Alternative pattern that might exist
const ALT_OLD_PATTERN = /function isBuildTime\(\): boolean \{[\s\S]*?process\.env\.NODE_ENV !== ['"]test['"][\s\S]*?\}/g;

const API_ROUTES = [
  'src/app/api/usuarios/export/pdf/route.ts',
  'src/app/api/usuarios/export/csv/route.ts',
  'src/app/api/usuarios/[id]/auditoria/route.ts',
  'src/app/api/usuarios/[id]/route.ts',
  'src/app/api/usuarios/[id]/status/route.ts',
  'src/app/api/usuarios/route.ts',
  'src/app/api/auth/unlock/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/auth/reset-password/route.ts',
  'src/app/api/auth/mfa/request/route.ts',
  'src/app/api/auth/mfa/verify/route.ts',
  'src/app/api/auth/mfa/resend/route.ts',
  'src/app/api/auth/user-status/route.ts',
  'src/app/api/auth/forgot-password/route.ts',
  'src/app/api/clientes/export/pdf/route.ts',
  'src/app/api/clientes/export/csv/route.ts',
  'src/app/api/clientes/route.ts',
  'src/app/api/propostas/export/pdf/route.ts',
  'src/app/api/propostas/export/csv/route.ts',
  'src/app/api/propostas/route.ts',
  'src/app/api/propostas/rascunho/route.ts'
];

let filesFixed = 0;
let totalFiles = 0;

console.log('🔧 Corrigindo funções isBuildTime() em API routes...\n');

for (const routeFile of API_ROUTES) {
  const fullPath = path.join(process.cwd(), routeFile);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${routeFile}`);
    continue;
  }
  
  totalFiles++;
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Try exact match replacement first
  if (content.includes(OLD_BUILD_TIME_FUNCTION)) {
    content = content.replace(OLD_BUILD_TIME_FUNCTION, NEW_BUILD_TIME_FUNCTION);
    modified = true;
  } else if (ALT_OLD_PATTERN.test(content)) {
    // Try regex replacement for variations
    content = content.replace(ALT_OLD_PATTERN, NEW_BUILD_TIME_FUNCTION);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Corrigido: ${routeFile}`);
    filesFixed++;
  } else {
    console.log(`ℹ️  Não modificado (já corrigido ou padrão diferente): ${routeFile}`);
  }
}

console.log(`\n📊 Resumo:`);
console.log(`   Arquivos verificados: ${totalFiles}`);
console.log(`   Arquivos corrigidos: ${filesFixed}`);
console.log(`   Arquivos não modificados: ${totalFiles - filesFixed}`);

if (filesFixed > 0) {
  console.log('\n✨ Correções aplicadas com sucesso!');
  console.log('   Execute os testes para verificar: npm test');
} else {
  console.log('\n🤔 Nenhuma correção foi aplicada. Verifique se os padrões de código mudaram.');
}