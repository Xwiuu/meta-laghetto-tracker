---


Este é para o "designer" e "arquiteto" da casa. Explica como rodar a interface.

**Crie/Altere o ficheiro `meta-laghetto-tracker/frontend/README.md` com este conteúdo:**

````markdown

Esta pasta contém a interface do utilizador (UI) para o Meta Laghetto Tracker, construída com Next.js, Tailwind CSS e shadcn/ui.

## ▶️ Como Executar o Frontend

**1. Pré-requisitos:**

- Node.js (v18+)
- O servidor do **backend** deve estar a ser executado.

**2. Instalação:**

- Navegue para a pasta `frontend` no terminal.
- Instale as dependências:
  ```bash
  npm install
  ```

3. Iniciar a Aplicação:

Rode o servidor de desenvolvimento:

Bash

npm run dev
Abra o seu navegador e acesse http://localhost:3000.

Principais Páginas
/: Página de Login.

/dashboard: Dashboard principal de performance.

/dashboard/gastos-diarios: Relatório detalhado de gastos.

Contextos Globais
A aplicação utiliza React Context para gerir o estado global:

DateContext: Partilha o período de datas selecionado entre todas as páginas do dashboard.

LoadingContext: Controla a exibição da tela de carregamento global.

_(Para o backend, pode ser necessário criar um ficheiro `docker-compose.yml` simples e um `.env.example` para que as instruções do README façam sentido, mas podemos fazer isso como um polimento final se quiser)._

Depois de criar estes três ficheiros, o seu projeto estará profissionalmente documentado e pronto para ser partilhado ou para que qualquer outro desenvolvedor (ou até mesmo nós no futuro) possa facilmente configurá-lo e executá-lo.
````
