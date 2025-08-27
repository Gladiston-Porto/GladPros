// Teste rápido do login após correção do Prisma
require('dotenv').config();
const fetch = require('node-fetch');

async function testarLogin() {
  try {
    console.log('🧪 Testando login após correção do Prisma...\n');

  const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.SEED_ADMIN_EMAIL || 'admin@gladpros.local',
        password: process.env.SEED_ADMIN_PASS || 'Admin@12345'
      })
    });

    console.log(`📊 Status: ${response.status}`);
    
    const result = await response.json();
    console.log('📄 Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Login funcionando corretamente!');
    } else {
      console.log('❌ Erro no login:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando com "npm run dev"');
  }
}

testarLogin();
