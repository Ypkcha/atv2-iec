## Como executar localmente

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
