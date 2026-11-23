# Task Tracker — LDW

## Como executar localmente

Use Node.js 24, pnpm 11.20.0 ou outra versão compatível da série 11 e Docker Desktop. Os comandos abaixo usam o PowerShell no Windows.

**1. Suba o PostgreSQL.** Na raiz do repositório:

```powershell
docker compose up -d db
docker compose exec db pg_isready -U postgres
```

**2. Inicie a API.**

```powershell
cd backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm install
pnpm exec sequelize-cli db:migrate
pnpm dev
```

Confira se a [API está ativa](http://localhost:3000/api/health) e veja a [documentação no Swagger](http://localhost:3000/api/docs).

## AT2 de IEC — Entrega contínua do backend

O workflow [CI/CD do Task Tracker](.github/workflows/integracao-continua.yml) roda lint, formatação, checagem de tipos e testes. Depois, compila o backend e constrói a imagem de produção. Em um push para `main`, o último job envia um POST ao Render com o SHA do commit que passou nas verificações. Pull requests e execuções manuais validam o código e a imagem.

### Configurar o Render

1. Crie um PostgreSQL no Render. Crie também um **Web Service** vinculado a este repositório no GitHub e à branch `main`, usando o runtime **Docker**. Use a mesma região para o serviço e o banco.
2. Defina **Root Directory** como `backend`, **Dockerfile Path** como `./Dockerfile` e **Docker Build Context Directory** como `.`, relativos a `backend`. Use o comando padrão do Dockerfile.
3. Configure **Auto-Deploy** como **Off** e **Health Check Path** como `/api/health`. O processo escuta a porta fornecida pelo Render na variável `PORT`.
4. No painel de variáveis do serviço, configure:

| Variável | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DB_HOST` | Host interno do PostgreSQL |
| `DB_PORT` | `5432` |
| `DB_NAME` | Nome do banco definido no Render |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_SSL` | `true` para exigir TLS |
| `JWT_SECRET` | Chave aleatória com pelo menos 32 caracteres |

A imagem executa as migrations no início, antes de subir a API. No PostgreSQL interno do Render, o TLS usa um certificado autoassinado.

5. Em **Settings** do Web Service, copie o **Deploy Hook**. No GitHub, abra **Settings → Secrets and variables → Actions → New repository secret** e salve a URL como `RENDER_DEPLOY_HOOK_URL`. Mantenha a URL e as credenciais fora do Git.
6. Faça um push para `main`. Acompanhe os três jobs em **Actions** e confirme, em **Events** no Render, que a implantação do mesmo commit ficou ativa. O workflow aceita HTTP `200` ou `201` conforme o enunciado. Se receber `202` por haver outro deploy em andamento, aguarde sua conclusão antes de repetir.

### API publicada

Após o primeiro deploy bem-sucedido, informe aqui a URL pública do serviço no Render e adicione o link para `/api/health`. O endpoint deve retornar HTTP 200 e incluir `status`, `uptime` em segundos e `timestamp`.

Para verificar a persistência, abra `/api/docs` na URL pública, crie uma conta de teste, faça login, autorize o Swagger com o JWT e crie um projeto com `POST /api/projects`. Depois confirme o registro com `GET /api/projects`.

[Configuração de monorepos no Render](https://render.com/docs/monorepo-support) · [Deploy Hooks](https://render.com/docs/deploy-hooks)

## AT1 — API do Task Tracker

API REST desenvolvida em **Node.js**, **Express**, **TypeScript**,
**Sequelize** e **PostgreSQL** para gerenciamento de usuários, projetos
e tarefas.

A aplicação possui autenticação com **JWT**, documentação interativa com
**Swagger**, migrations com **Sequelize CLI**, testes com **Vitest** e
suporte a execução do PostgreSQL/API com **Docker Compose**.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Sequelize
- Sequelize CLI
- JWT
- bcryptjs
- Swagger / OpenAPI 3
- Docker e Docker Compose
- Vitest
- ESLint
- Prettier
- pnpm

## Funcionalidades

A API permite:

- cadastrar usuários e consultar, atualizar ou excluir a própria conta;
- autenticar usuários e gerar token JWT;
- cadastrar, listar, consultar, atualizar e excluir projetos;
- cadastrar, listar, consultar, atualizar e excluir tarefas;
- associar projetos ao usuário autenticado;
- associar tarefas aos projetos;
- controlar acesso às rotas protegidas utilizando JWT;
- documentar e testar os endpoints através do Swagger.

## Estrutura principal

```text
ATV-LDW-IEC/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── docs/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── package.json
```

## Variáveis de ambiente

O arquivo `backend/.env.example` é o modelo para o `backend/.env`. Versione os modelos e mantenha os arquivos `.env` locais.

Para executar a API no computador e o PostgreSQL no Docker, use os valores de desenvolvimento de `backend/.env.example`:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
DB_SSL=false

JWT_SECRET=troque_por_uma_chave_secreta
```

## Autenticação

As rotas protegidas utilizam **Bearer Token JWT**.

Primeiro faça login em:

```text
POST /api/auth/login
```

Exemplo:

```json
{
  "email": "ana.silva@email.com",
  "password": "123456"
}
```

Após receber o token, no Swagger clique em **Authorize** e informe o
token. O Swagger adicionará o esquema Bearer à requisição.

## Principais endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | `/api/auth/login` | Realiza login e retorna o token JWT. |
| POST | `/api/users` | Cadastra um usuário. |
| GET | `/api/users` | Retorna a conta autenticada em uma lista. |
| GET | `/api/users/{id}` | Consulta a própria conta. |
| PUT | `/api/users/{id}` | Atualiza a própria conta. |
| DELETE | `/api/users/{id}` | Exclui a própria conta. |
| GET | `/api/projects` | Lista os projetos do usuário autenticado. |
| POST | `/api/projects` | Cria um projeto. |
| GET | `/api/projects/{id}` | Consulta um projeto. |
| PUT | `/api/projects/{id}` | Atualiza um projeto. |
| DELETE | `/api/projects/{id}` | Exclui um projeto. |
| GET | `/api/tasks` | Lista as tarefas dos projetos do usuário autenticado. |
| POST | `/api/tasks` | Cria uma tarefa em um projeto. |
| GET | `/api/tasks/{id}` | Consulta uma tarefa. |
| PUT | `/api/tasks/{id}` | Atualiza uma tarefa. |
| DELETE | `/api/tasks/{id}` | Exclui uma tarefa. |

Para ver exemplos de corpos de requisição, respostas e códigos HTTP, consulte o [Swagger](http://localhost:3000/api/docs).

## Scripts do backend

Dentro da pasta `backend`:

```bat
pnpm dev
pnpm build
pnpm type-check
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format:fix
pnpm check-all
pnpm test
pnpm test:run
pnpm test:coverage
```

### Verificação do TypeScript

```bat
pnpm type-check
```

ou:

```bat
pnpm exec tsc --noEmit
```

### Testes

Executar os testes em modo interativo:

```bat
pnpm test
```

Executar uma única vez:

```bat
pnpm test:run
```

## Scripts do Docker

Na raiz do projeto, `pnpm run docker:build-api` constrói a imagem do backend. O comando `pnpm run compose:up` sobe o PostgreSQL e a API em contêineres. Use esse modo quando o backend local estiver desligado, pois ambos usam a porta `3000`.

| Comando | Ação |
| --- | --- |
| `docker compose logs -f db` | Acompanha os logs do PostgreSQL. |
| `pnpm run compose:logs` | Acompanha os logs dos serviços do Compose. |
| `pnpm run compose:down` | Encerra os serviços do Compose. |

## Documentação da API

A documentação utiliza **OpenAPI 3.0** com Swagger UI e inclui:

- endpoints da aplicação;
- parâmetros;
- Request Bodies;
- autenticação JWT;
- códigos HTTP;
- exemplos de respostas JSON;
- schemas de usuários, projetos e tarefas;
- respostas de erro.

Acesse:

```text
http://localhost:3000/api/docs
```

## Códigos HTTP utilizados

A API utiliza, entre outros:

- `200 OK` --- operação realizada com sucesso;
- `201 Created` --- recurso criado;
- `204 No Content` --- recurso excluído;
- `400 Bad Request` --- dados inválidos;
- `401 Unauthorized` --- autenticação ausente ou inválida;
- `403 Forbidden` --- acesso aos dados de outra conta;
- `404 Not Found` --- recurso não encontrado;
- `409 Conflict` --- conflito, como e-mail já cadastrado;
- `500 Internal Server Error` --- erro interno inesperado.

## Segurança

- As senhas são armazenadas utilizando hash com `bcryptjs`.
- A autenticação utiliza JWT.
- Dados sensíveis são configurados por variáveis de ambiente.
- O arquivo `.env` não deve ser enviado ao repositório.
- Rotas de projetos e tarefas são protegidas por autenticação.

## Licença

Projeto acadêmico desenvolvido para a disciplina de **Laboratório de
Desenvolvimento Web (LDW)**.
