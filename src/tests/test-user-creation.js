// Script para testar criação de usuário e email exatamente como no sistema
const fetch = require('node-fetch');

async function testUserCreation() {
  try {
    console.log('=== TESTANDO CRIAÇÃO DE USUÁRIO ===');
    
    const userData = {
      email: 'teste.fluxo@gmail.com', // Use um email real que você tenha acesso
      nomeCompleto: 'Usuário de Teste',
      role: 'USUARIO',
      status: 'ATIVO'
    };

    console.log('Dados do usuário:', userData);
    
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Usuário criado com sucesso:', result);
      console.log('📧 Verifique o email:', userData.email);
      console.log('📧 Verifique também a pasta SPAM/LIXEIRA');
    } else {
      console.log('❌ Erro na criação:', result);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testUserCreation();
