# ⚙️ Meta Laghetto Tracker - Backend

Esta pasta contém a API do backend para o Meta Laghetto Tracker.

## ▶️ Como Executar o Backend

**1. Pré-requisitos:**
* Docker e Docker Compose
* Node.js (v18+)

**2. Configuração do Banco de Dados:**
* Certifique-se de que o Docker Desktop está a ser executado.
* No terminal, na pasta `backend`, inicie o container do PostgreSQL:
  ```bash
  docker-compose up -d
3. Variáveis de Ambiente:

Renomeie o ficheiro .env.example para .env.

Preencha todas as variáveis necessárias:

DB_*: Credenciais para o banco de dados PostgreSQL.

META_*: O seu Access Token de longa duração e o ID da sua Conta de Anúncios.

GEMINI_API_KEY: A sua chave de API do Google AI Studio.

4. Instalação e Migrations:

Instale as dependências:

Bash

npm install
Execute as migrations para criar a estrutura do banco de dados:

Bash

npx knex migrate:latest
(Opcional) Popule o banco com um utilizador de teste:

Bash

npm run seed
5. Iniciar o Servidor:

Rode o servidor em modo de desenvolvimento:

Bash

npm run dev
O servidor estará disponível em http://localhost:3333.

Endpoints Principais
POST /api/auth/login: Autenticação.

POST /api/sync/campaigns: Dispara a sincronização de todos os dados do Meta.

GET /api/dashboard/*: Endpoints que fornecem dados para o frontend.