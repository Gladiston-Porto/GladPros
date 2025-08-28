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

📖 Documentação

Visão geral: docs/01-arquitetura.md

Módulos e lógica: docs/02-logica-sistema.md

Autenticação: docs/03-fluxo-autenticacao.md

Estrutura do banco: docs/04-estrutura-db.md

Roadmap: docs/05-roadmap.md

GitHub Status Checker: docs/08-github-status-checker.md

🔧 Ferramentas de Desenvolvimento

**Verificação de Status do GitHub:**
```bash
# Verificar branches e CI/CD
npm run github:status

# Versão local (sem necessidade de token)
npm run github:local

# Wrapper com shell script
npm run github:check
```

**Outros Scripts Úteis:**
```bash
# Verificar variáveis de ambiente
npm run build:check

# Executar testes com cobertura
npm run test:coverage

# Verificar possíveis vazamentos de dados
npm run secret:scan
```

✉️ Contato

Gladiston Porto – GladPros.com