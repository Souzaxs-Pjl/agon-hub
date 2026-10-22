# AGON Hub — Documentação da API REST

## 1. Visão geral

A API do AGON Hub utiliza Node.js, Express e PostgreSQL. As respostas das rotas são enviadas em JSON.

**Endereço local padrão:** `http://localhost:3000`

As rotas descritas neste documento usam o prefixo `/api`.

## 2. Cabeçalhos e autenticação

Para enviar dados JSON, use o cabeçalho:

```http
Content-Type: application/json
```

As rotas protegidas exigem um token JWT no cabeçalho `Authorization`:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

O token é obtido por meio da rota `POST /api/auth/login`. Nesta implementação, sua validade é de duas horas.

### Níveis de acesso

- **Público:** não exige autenticação.
- **Autenticado:** exige token JWT válido.
- **Administrador:** exige token JWT válido e perfil `admin`.

## 3. Resumo das rotas implementadas

| Método | Rota | Finalidade | Acesso |
|---|---|---|---|
| GET | `/api/` | Verificar se a API está funcionando | Público |
| GET | `/api/health` | Verificar a disponibilidade básica da API | Público |
| POST | `/api/auth/register` | Cadastrar usuário comum | Público |
| POST | `/api/auth/login` | Entrar e gerar token JWT | Público |
| GET | `/api/auth/me` | Consultar o próprio perfil | Autenticado |
| GET | `/api/teams` | Listar equipes | Público |
| GET | `/api/teams/:id` | Consultar uma equipe pelo ID | Público |
| POST | `/api/teams` | Cadastrar equipe | Administrador |
| PUT | `/api/teams/:id` | Atualizar campos de uma equipe | Administrador |
| DELETE | `/api/teams/:id` | Excluir equipe | Administrador |

## 4. Verificação da API

### `GET /api/`

Verifica se a API está respondendo.

**Resposta esperada: `200 OK`**

```json
{
  "message": "AGON Hub API está funcionando!",
  "status": "online"
}
```

### `GET /api/health`

Verifica a disponibilidade básica do serviço. Esta rota não comprova, por si só, que o PostgreSQL está acessível.

**Resposta esperada: `200 OK`**

```json
{
  "status": "healthy",
  "service": "AGON Hub API"
}
```

## 5. Autenticação

### `POST /api/auth/register`

Cadastra um usuário com perfil comum. O cliente não pode escolher o próprio perfil de administrador enviando um campo `role`.

**Acesso:** público.

**Corpo JSON:**

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | Sim | Texto de até 120 caracteres; não pode ficar vazio |
| `username` | Sim | De 3 a 50 caracteres; permite letras ASCII, números, ponto, hífen e sublinhado |
| `email` | Sim | E-mail válido; máximo de 255 caracteres |
| `password` | Sim | Mínimo de 8 caracteres |

**Exemplo de requisição:**

```json
{
  "name": "Usuário de Teste",
  "username": "usuario_teste",
  "email": "usuario@example.com",
  "password": "SenhaForte123!"
}
```

**Resposta esperada: `201 Created`**

```json
{
  "message": "Usuário cadastrado com sucesso.",
  "usuario": {
    "id": "10",
    "name": "Usuário de Teste",
    "username": "usuario_teste",
    "email": "usuario@example.com",
    "profile_image": null,
    "bio": null,
    "created_at": "2026-10-22T18:00:00.000Z"
  }
}
```

Os valores acima são ilustrativos. O ID e a data reais são gerados pelo banco de dados. A resposta não contém senha nem hash da senha.

**Possíveis erros:**

- `400 Bad Request`: campo obrigatório ausente ou inválido.
- `409 Conflict`: username ou e-mail já existente.
- `500 Internal Server Error`: erro interno ao processar a solicitação.

A senha é armazenada como hash bcrypt, não em texto puro.

### `POST /api/auth/login`

Autentica uma conta e gera um token JWT.

**Acesso:** público.

**Corpo JSON:** pode usar `login`, `username` ou `email` para identificar a conta, junto com `password`.

```json
{
  "login": "usuario_teste",
  "password": "SenhaForte123!"
}
```

**Resposta esperada: `200 OK`**

```json
{
  "message": "Login realizado com sucesso.",
  "token": "TOKEN_JWT_GERADO",
  "token_type": "Bearer",
  "expires_in": 7200,
  "usuario": {
    "id": "10",
    "name": "Usuário de Teste",
    "username": "usuario_teste",
    "email": "usuario@example.com",
    "profile_image": null,
    "bio": null,
    "role": "user",
    "created_at": "2026-10-22T18:00:00.000Z"
  }
}
```

O token é ilustrativo; use o token retornado pela API. Não publique nem compartilhe tokens reais.

**Possíveis erros:**

- `400 Bad Request`: identificador ou senha não informados.
- `401 Unauthorized`: usuário ou senha incorretos.
- `500 Internal Server Error`: `JWT_SECRET` ausente/inválido ou falha interna.

### `GET /api/auth/me`

Retorna o perfil do usuário identificado pelo token.

**Acesso:** autenticado.

**Cabeçalho obrigatório:** `Authorization: Bearer SEU_TOKEN_JWT`.

**Resposta esperada: `200 OK`**

```json
{
  "usuario": {
    "id": "10",
    "name": "Usuário de Teste",
    "username": "usuario_teste",
    "email": "usuario@example.com",
    "profile_image": null,
    "bio": null,
    "created_at": "2026-10-22T18:00:00.000Z",
    "role": "user"
  }
}
```

**Possíveis erros:** `401 Unauthorized` para token ausente/inválido/expirado; `404 Not Found` se a conta não for encontrada; `500 Internal Server Error` em falha interna.

## 6. Equipes

A tabela `teams` contém, entre outros campos, `id`, `name`, `short_name`, `slug`, `description`, `logo_url`, `team_type`, `is_fictional`, `institution_id`, `city`, `state`, `country`, `founded_at`, `created_at` e `updated_at`.

### `GET /api/teams`

Lista as equipes em ordem crescente de ID.

**Acesso:** público. **Parâmetros:** nenhum.

**Resposta esperada: `200 OK`** — array JSON com os registros de equipes. Exemplo resumido:

```json
[
  {
    "id": "1",
    "name": "Turquia",
    "short_name": "TUR",
    "slug": "turquia",
    "description": null,
    "logo_url": null,
    "team_type": "FICTIONAL",
    "is_fictional": true,
    "institution_id": null,
    "city": null,
    "state": null,
    "country": "Brasil",
    "founded_at": null
  }
]
```

A resposta real também pode conter os campos de criação e atualização e inclui as equipes existentes no banco.

### `GET /api/teams/:id`

Consulta uma equipe pelo ID.

**Acesso:** público.

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `id` | Sim | ID inteiro positivo da equipe, na URL |

Exemplo: `GET /api/teams/1`.

**Resposta esperada:** `200 OK` com o objeto da equipe.

**Possíveis erros:** `400 Bad Request` se o ID for inválido; `404 Not Found` se a equipe não existir.

### `POST /api/teams`

Cria uma equipe.

**Acesso:** autenticado como `admin`.

**Cabeçalho obrigatório:** `Authorization: Bearer SEU_TOKEN_JWT`.

| Campo | Obrigatório | Descrição |
|---|---|---|
| `name` | Sim | Nome da equipe |
| `short_name` | Não | Nome curto |
| `slug` | Não | Identificador único; se omitido, é gerado a partir do nome |
| `description` | Não | Descrição |
| `logo_url` | Não | Caminho ou URL do logotipo |
| `team_type` | Não | Tipo da equipe; padrão `OTHER`, com compatibilidade para o campo `type` |
| `type` | Não | Alias compatível para `team_type` |
| `is_fictional` | Não | Booleano que indica se a equipe é fictícia |
| `institution_id` | Não | ID de uma instituição existente ou nulo |
| `city` | Não | Cidade |
| `state` | Não | Estado |
| `country` | Não | País; padrão `Brasil` |
| `founded_at` | Não | Data no formato `AAAA-MM-DD` ou nulo |

**Exemplo de requisição:**

```json
{
  "name": "Equipe de Exemplo",
  "short_name": "EXEMPLO",
  "slug": "equipe-de-exemplo",
  "description": "Descrição da equipe.",
  "team_type": "OTHER",
  "is_fictional": false,
  "country": "Brasil"
}
```

**Resposta esperada: `201 Created`**, com o registro criado e o ID gerado pelo banco.

**Possíveis erros:** `400 Bad Request` para dados inválidos ou instituição inexistente; `401 Unauthorized` sem token válido; `403 Forbidden` se não for administrador; `409 Conflict` se o slug já estiver em uso; `500 Internal Server Error` em falha interna.

### `PUT /api/teams/:id`

Atualiza um ou mais campos de uma equipe existente. Apesar do método HTTP `PUT`, o controlador atual permite enviar apenas os campos que precisam ser alterados.

**Acesso:** autenticado como `admin`.

**Parâmetro obrigatório:** `id`, inteiro positivo na URL.

O corpo aceita os campos descritos na tabela do `POST`. Campos omitidos são preservados. Os campos `name`, `slug` e `country`, quando enviados, não podem ficar vazios.

**Exemplo de requisição:**

```json
{
  "name": "Equipe de Exemplo Atualizada",
  "slug": "equipe-de-exemplo-atualizada",
  "description": "Descrição revisada."
}
```

**Resposta esperada:** `200 OK` com os dados atualizados.

**Possíveis erros:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` ou `500 Internal Server Error`.

### `DELETE /api/teams/:id`

Exclui uma equipe pelo ID.

**Acesso:** autenticado como `admin`.

**Parâmetro obrigatório:** `id`, inteiro positivo na URL. Não exige corpo JSON.

Exemplo: `DELETE /api/teams/84`.

**Resposta esperada: `200 OK`**, contendo uma mensagem e os dados da equipe removida.

**Possíveis erros:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` ou `500 Internal Server Error`.

A exclusão pode afetar registros relacionados conforme as restrições e ações em cascata do PostgreSQL. Use a operação com cuidado.

## 7. Códigos HTTP utilizados

| Código | Significado |
|---|---|
| `200 OK` | Operação concluída |
| `201 Created` | Registro criado |
| `400 Bad Request` | Dados ou parâmetros inválidos |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `403 Forbidden` | Usuário autenticado sem permissão |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Conflito com registro existente |
| `500 Internal Server Error` | Erro interno |

## 8. Configuração local e segurança

O backend carrega configurações a partir de `backend/.env` por meio do `dotenv`.

Variáveis necessárias:

- `PORT`: porta HTTP da API.
- `DB_HOST`: endereço do PostgreSQL.
- `DB_PORT`: porta do PostgreSQL.
- `DB_NAME`: nome do banco de dados.
- `DB_USER`: usuário do banco.
- `DB_PASSWORD`: senha do banco.
- `JWT_SECRET`: segredo usado para assinar os tokens JWT; deve ser aleatório e ter no mínimo 32 caracteres.

O arquivo `backend/.env` não deve ser enviado ao GitHub. Use `backend/.env.example` apenas como modelo e substitua os valores de exemplo localmente.

As credenciais de demonstração de `seed.sql` devem ser usadas somente em desenvolvimento local. Altere ou remova essas contas antes de qualquer implantação pública.

## 9. Funcionalidades ainda não documentadas como endpoints

Esta documentação cobre somente as rotas implementadas nesta versão. Recursos previstos no projeto — como CRUD de atletas, instituições, modalidades, campeonatos, partidas, notícias, comentários, reações, upload de arquivos e outras funcionalidades sociais — precisarão de implementação e documentação próprias antes de serem considerados disponíveis na API.
