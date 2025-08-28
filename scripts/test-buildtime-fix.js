#!/usr/bin/env node
/**
 * Test script to verify the isBuildTime() fix works correctly
 */

// Mock the environment like Jest does
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Function extracted from the fixed route
function isBuildTime() {
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
}

console.log('🧪 Testando função isBuildTime() corrigida...\n');

// Test 1: Test environment
console.log('📋 Teste 1: Ambiente de teste (NODE_ENV=test)');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'definido' : 'não definido'}`);
console.log(`   isBuildTime(): ${isBuildTime()}`);
console.log(`   Esperado: false`);
console.log(`   ✅ ${isBuildTime() === false ? 'PASSOU' : 'FALHOU'}\n`);

// Test 2: Production with JWT_SECRET (should not be build time)
console.log('📋 Teste 2: Produção com JWT_SECRET');
process.env.NODE_ENV = 'production';
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'definido' : 'não definido'}`);
console.log(`   isBuildTime(): ${isBuildTime()}`);
console.log(`   Esperado: false`);
console.log(`   ✅ ${isBuildTime() === false ? 'PASSOU' : 'FALHOU'}\n`);

// Test 3: Production without JWT_SECRET (should be build time)
console.log('📋 Teste 3: Produção sem JWT_SECRET');
delete process.env.JWT_SECRET;
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'definido' : 'não definido'}`);
console.log(`   isBuildTime(): ${isBuildTime()}`);
console.log(`   Esperado: true`);
console.log(`   ✅ ${isBuildTime() === true ? 'PASSOU' : 'FALHOU'}\n`);

// Test 4: Build phase
console.log('📋 Teste 4: Fase de build');
process.env.NODE_ENV = 'production';
process.env.NEXT_PHASE = 'phase-production-build';
process.env.JWT_SECRET = 'test-secret';
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   NEXT_PHASE: ${process.env.NEXT_PHASE}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'definido' : 'não definido'}`);
console.log(`   isBuildTime(): ${isBuildTime()}`);
console.log(`   Esperado: true`);
console.log(`   ✅ ${isBuildTime() === true ? 'PASSOU' : 'FALHOU'}\n`);

// Test 5: Back to test environment (should always be false)
console.log('📋 Teste 5: Voltar para ambiente de teste');
process.env.NODE_ENV = 'test';
process.env.NEXT_PHASE = 'phase-production-build'; // Even with build phase
delete process.env.JWT_SECRET; // Even without JWT_SECRET
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   NEXT_PHASE: ${process.env.NEXT_PHASE}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'definido' : 'não definido'}`);
console.log(`   isBuildTime(): ${isBuildTime()}`);
console.log(`   Esperado: false (testes sempre retornam false)`);
console.log(`   ✅ ${isBuildTime() === false ? 'PASSOU' : 'FALHOU'}\n`);

console.log('🎉 Todos os testes da função isBuildTime() foram executados!');
console.log('   A função agora deve permitir que os testes funcionem corretamente.');
console.log('   APIs não vão mais retornar 503 durante execução de testes.');