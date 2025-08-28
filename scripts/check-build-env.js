// scripts/check-build-env.js
// Verifica se as variáveis de ambiente necessárias estão configuradas antes do build

const requiredEnvVars = [
  'JWT_SECRET',
  'CLIENT_DOC_ENCRYPTION_KEY_BASE64',
  'DATABASE_URL'
];

const optionalEnvVars = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('🔍 Verificando variáveis de ambiente para build...\n');

let hasErrors = false;

// Verificar variáveis obrigatórias
console.log('📋 Variáveis obrigatórias:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: MISSING`);
    hasErrors = true;
  } else if (envVar === 'JWT_SECRET' && value.length < 32) {
    console.log(`❌ ${envVar}: TOO SHORT (mínimo 32 caracteres)`);
    hasErrors = true;
  } else if (envVar === 'CLIENT_DOC_ENCRYPTION_KEY_BASE64' && value.length < 44) {
    console.log(`❌ ${envVar}: INVALID (deve ser base64 de 32 bytes)`);
    hasErrors = true;
  } else {
    console.log(`✅ ${envVar}: OK`);
  }
});

// Verificar variáveis opcionais
console.log('\n📋 Variáveis opcionais:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`⚠️  ${envVar}: MISSING (funcionalidades de email podem não funcionar)`);
  } else {
    console.log(`✅ ${envVar}: OK`);
  }
});

// Verificar se estamos em modo de produção sem variáveis críticas
if (process.env.NODE_ENV === 'production' && hasErrors) {
  console.log('\n🚨 ERRO: Variáveis obrigatórias não configuradas para produção!');
  process.exit(1);
}

// Verificar se é build time
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-production-server' ||
  !process.env.NODE_ENV;

if (isBuildTime && hasErrors) {
  console.log('\n⚠️  AVISO: Algumas variáveis estão faltando, mas o build pode continuar com valores temporários.');
  console.log('   Certifique-se de configurar todas as variáveis em produção.\n');
} else if (!hasErrors) {
  console.log('\n✅ Todas as variáveis obrigatórias estão configuradas!\n');
}

if (hasErrors && !isBuildTime) {
  console.log('\n🚨 ERRO: Variáveis obrigatórias não configuradas!');
  process.exit(1);
}
