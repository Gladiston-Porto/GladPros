// scripts/increment-tokenVersion.js
const { prisma } = require('../src/lib/prisma');

async function main(){
  console.log('Incrementing tokenVersion for all users...');
  const res = await prisma.$executeRawUnsafe('UPDATE Usuario SET tokenVersion = COALESCE(tokenVersion,0) + 1');
  console.log('Done. Rows affected (may be driver-dependent):', res);
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
