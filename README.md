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

🔧 Scripts Úteis

**Verificar status do GitHub:**
```bash
# Usando Bash (Linux/macOS)
GITHUB_TOKEN=ghp_xxx npm run github:status

# Usando Node.js (todas as plataformas)
GITHUB_TOKEN=ghp_xxx npm run github:status:node

# Usando PowerShell (Windows)
$env:GITHUB_TOKEN='ghp_xxx'
powershell scripts/check-github-status.ps1
```

**Outros scripts:**
```bash
npm run build:check    # Verificar variáveis antes do build
npm run secret:scan    # Escanear por secrets expostos
npm test              # Executar testes
```

✉️ Contato

Gladiston Porto – GladPros.com