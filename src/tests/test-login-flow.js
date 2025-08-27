// Script para testar fluxo completo de login
const fetch = require('node-fetch');

async function testLoginFlow() {
  try {
    console.log('=== TESTE COMPLETO DE LOGIN ===\n');
    
    const loginData = {
      email: 'gladiston.porto@gladpros.com',
      password: '123456' // Substitua pela senha provisória correta
    };
    
    console.log('1. Fazendo login...');
    console.log('Email:', loginData.email);
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    
    console.log('\n--- RESPOSTA DO LOGIN ---');
    console.log('Status:', loginResponse.status);
    console.log('Data:', JSON.stringify(loginResult, null, 2));
    
    if (!loginResponse.ok) {
      console.log('❌ Erro no login:', loginResult.error);
      return;
    }
    
    if (loginResult.mfaRequired) {
      console.log('\n2. MFA é necessário!');
      console.log('Dados do usuário:');
      console.log('- ID:', loginResult.user.id);
      console.log('- Email:', loginResult.user.email);
      console.log('- Nome:', loginResult.user.nomeCompleto);
      console.log('- Primeiro Acesso:', loginResult.user.primeiroAcesso);
      console.log('- Senha Provisória:', loginResult.user.senhaProvisoria);
      console.log('- Next Step:', loginResult.nextStep);
      
      console.log('\n✅ Fluxo correto: Deveria redirecionar para MFA');
      console.log('📧 Verifique seu email para o código MFA');
    } else {
      console.log('\n❌ PROBLEMA: Login sem MFA (não deveria acontecer)');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testLoginFlow();
