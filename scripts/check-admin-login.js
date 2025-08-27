const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@gladpros.local'
  const senha = 'Admin@12345'
  const user = await prisma.usuario.findUnique({ where: { email } })
  if (!user) {
    console.error('Usuário não encontrado')
    process.exit(2)
  }
  console.log('Usuário encontrado:', { id: user.id, email: user.email, role: user.role, status: user.status })
  const ok = await bcrypt.compare(senha, user.senha)
  console.log('Senha bate?', ok)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
