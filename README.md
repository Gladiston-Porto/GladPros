GladPros - Sistema de Gestão Empresarial

GladPros é um sistema modular, bilíngue e seguro para gestão de clientes, propostas, projetos, estoque, almoxarifado e financeiro. Conta com autenticação por MFA, tokens de acesso, e um dashboard inteligente adaptado ao nível de acesso do usuário.

🧰 Stack Utilizada

Next.js + TypeScript + TailwindCSS

Prisma com MariaDB

Docker para orquestração local

Autenticação com JWT, Refresh Token e MFA

🚀 Como Rodar o Projeto

npm install

docker-compose up -d

npx prisma migrate dev

npm run dev

📁 Estrutura

src/modules/ – módulos como clientes, propostas, projetos etc.

src/app/ – rotas App Router do Next.js

src/components/ – componentes reutilizáveis

src/config/ – Axios, autenticação e i18n

prisma/ – schema e migrações

docs/ – documentação completa do sistema

scripts/ – utilitários e ferramentas de desenvolvimento

🔧 Scripts Disponíveis

npm run dev – executar em modo de desenvolvimento

npm run build – build para produção

npm run test – executar testes

npm run lint – verificar código com ESLint

npm run github:status – verificar status dos branches e CI/CD

npm run github:status-node – versão Node.js do verificador de status

🔍 Verificação de Status GitHub

O projeto inclui ferramentas para verificar o status dos branches e GitHub Actions:

• Scripts multiplataforma (Bash, PowerShell, Node.js)
• Verificação automática via GitHub Actions (agendada semanalmente)
• Relatórios coloridos com status detalhado
• Documentação completa em scripts/README-github-status.md

Para usar, defina GITHUB_TOKEN e execute npm run github:status

📖 Documentação

Visão geral: docs/01-arquitetura.md

Módulos e lógica: docs/02-logica-sistema.md

Autenticação: docs/03-fluxo-autenticacao.md

Estrutura do banco: docs/04-estrutura-db.md

Roadmap: docs/05-roadmap.md

✉️ Contato

Gladiston Porto – GladPros.com