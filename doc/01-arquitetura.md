Arquitetura do Projeto GladPros

Stack:

Frontend: Next.js + TypeScript + TailwindCSS

Backend: API Routes (Node.js runtime)

Banco de Dados: MariaDB + Prisma ORM

Autenticação: JWT + Refresh Token + MFA (email)

Infraestrutura: Docker + GitHub Actions

Estrutura base de pastas:

src/app/: rotas do Next.js com App Router

src/modules/: módulos funcionais por domínio (clientes, propostas...)

src/components/: componentes reutilizáveis

src/context/, hooks/, services/, lib/, styles/, config/

public/: imagens, assets, arquivos públicos

Boas práticas:

camelCase para arquivos JS/TS, kebab-case para pastas

Modularização clara para facilitar manutenção