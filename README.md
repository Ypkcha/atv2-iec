## AT2 de IEC — Entrega contínua do backend

O workflow [CI/CD do Task Tracker](.github/workflows/integracao-continua.yml) roda lint, formatação, checagem de tipos e testes. Depois, compila o backend e constrói a imagem de produção. Em um push para `main`, o último job envia um POST ao Render com o SHA do commit que passou nas verificações. Pull requests e execuções manuais validam o código e a imagem.
## Como executar localmente

1. Clone o repositório

```git clone git clone https://github.com/Ypkcha/atv2-iec.git
cd atv2-iec
```

2. Suba o PostgreSQL

Na raiz do repositório:

```docker compose up -d db
docker compose exec db pg_isready -U postgres
```

Prossiga quando aparecer accepting connections. Se o banco ainda estiver iniciando, aguarde alguns segundos e repita o segundo comando.

3. Configure as variáveis de ambiente

```cd backend
cp .env.example .env
```

No PowerShell:

```cd backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Os valores padrão de .env.example já funcionam com o banco do Docker Compose:

env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
DB_SSL=false

JWT_SECRET=troque_por_uma_chave_secreta

4. Instale as dependências e rode as migrations


```pnpm install
pnpm exec sequelize-cli db:migrate
```

As migrations criam as tabelas de usuários, projetos e tarefas.

5. Inicie a API

```pnpm dev
```

A API fica disponível em http://localhost:3000.

Opção 2: API e PostgreSQL, ambos no Docker Compose

Na raiz do repositório:

```docker compose up -d
docker compose exec api pnpm exec sequelize-cli db:migrate
docker compose logs -f api
```

Use esta opção com o backend local desligado, pois os dois usam a porta 3000.

Para encerrar:

```docker compose down
Verificando se está funcionando
Recurso	Endereço
Health check	http://localhost:3000/api/health
Documentação (Swagger)	http://localhost:3000/api/docs
```

O health check deve responder 200 OK com um JSON parecido com este:

```json
{
  "status": "OK",
  "mensagem": "Servidor Backend rodando com sucesso.",
  "uptime": 120,
  "timestamp": "2026-11-23T18:00:00.000Z"
}
```

Para testar a persistência no banco pelo Swagger:

Crie uma conta com POST /api/users.
Faça login com POST /api/auth/login e copie o token JWT.
Clique em Authorize e informe o token.
Crie um projeto com POST /api/projects.
Confirme o registro com GET /api/projects.
Scripts úteis (dentro de backend/)
Comando	O que faz:
```pnpm dev	Inicia a API com recarga automática.
pnpm build	Compila o TypeScript para dist/.
pnpm start	Executa a versão compilada (dist/server.js).
pnpm type-check	Valida os tipos sem gerar arquivos (tsc --noEmit).
pnpm lint	Executa o ESLint.
pnpm format:check	Verifica a formatação com o Prettier.
pnpm format:fix	Corrige a formatação automaticamente.
pnpm test:run	Executa os testes uma vez com o Vitest.
```
Testando a imagem de produção:
```docker build -t task-tracker-api:test ./backend
```

Para rodar a imagem apontando para o PostgreSQL local (as migrations executam ao iniciar):

```docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=postgres \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_SSL=false \
  -e JWT_SECRET=uma_chave_com_pelo_menos_32_caracteres \
  task-tracker-api:test
  ```

### Render

https://dashboard.render.com/web/srv-dc28d9gu01pc73fsmvu0/deploys/dep-dc28rm17lnhs73a1ume0?r=2026-11-23%4019%3A01%3A48~2026-11-23%4019%3A04%3A07

| Variável | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DB_HOST` | `atv2` |
| `DB_PORT` | `5432` |
| `DB_NAME` | Nome do banco definido no Render |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_SSL` | `true` para exigir TLS |
| `JWT_SECRET` | Chave aleatória com pelo menos 32 caracteres |


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
