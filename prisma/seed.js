const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@gladpros.local'
  const senha = process.env.SEED_ADMIN_PASS || 'Admin@12345'
  const senhaHash = await bcrypt.hash(senha, 10)

  await prisma.usuario.upsert({
    where: { email },
    update: { role: 'ADMIN', status: 'ATIVO' },
    create: {
      email,
  senha: senhaHash,
      nome: 'Administrador',
      role: 'ADMIN',
      status: 'ATIVO',
    },
  })
  console.log(`Admin criado/atualizado: ${email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
