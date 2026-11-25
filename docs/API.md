# Documentação da API — AGON Hub

API REST em Node.js + Express. Todas as rotas começam com `/api` e trocam dados em **JSON**.

> Esta documentação cresce a cada etapa. Rotas ainda não implementadas (equipes, atletas, campeonatos, partidas, notícias, modalidades) serão adicionadas aqui.

- **URL base (desenvolvimento):** `http://localhost:3000`
- **Formato:** requisições com corpo devem enviar o cabeçalho `Content-Type: application/json`.

## Autenticação

As rotas marcadas com 🔒 exigem um token JWT, obtido em `/api/auth/login` ou `/api/auth/register`, enviado em todas as requisições no cabeçalho:

```
Authorization: Bearer <token>
```

O token expira (padrão: 2 horas). Depois disso, é preciso fazer login de novo.

### Níveis de acesso

| Símbolo | Significado |
|---|---|
| 🌐 Pública | Qualquer pessoa pode chamar |
| 🔒 Logado | Exige token válido (qualquer usuário) |
| 🔒👑 Admin | Exige token válido **e** papel `admin` |

### Códigos de resposta e formato de erro

| Código | Quando acontece |
|---|---|
| 200 | Sucesso |
| 201 | Registro criado |
| 400 | Dados inválidos ou ausentes |
| 401 | Não autenticado (sem token, token inválido ou expirado) |
| 403 | Autenticado, mas sem permissão (não é admin) |
| 404 | Rota ou registro não encontrado |
| 409 | Conflito (ex.: e-mail já cadastrado; excluir algo que está em uso) |
| 500 | Erro interno do servidor |

Todo erro tem este formato:

```json
{ "erro": "Mensagem explicando o problema." }
```

Erros de validação podem trazer também a lista `detalhes`:

```json
{
  "erro": "Dados inválidos.",
  "detalhes": ["A senha deve ter no mínimo 8 caracteres."]
}
```

---

## Saúde

### `GET /api/saude`

- **Acesso:** 🌐 Pública
- **Finalidade:** confirmar que o servidor e o banco de dados estão funcionando.
- **Parâmetros:** nenhum.

**Resposta 200**
```json
{ "status": "ok", "banco": "ok" }
```

**Resposta 503** (banco fora do ar)
```json
{ "status": "erro", "banco": "indisponivel" }
```

---

## Autenticação

### `POST /api/auth/register`

- **Acesso:** 🌐 Pública
- **Finalidade:** cadastrar uma nova conta. **A conta é sempre criada com papel `usuario`.** Qualquer campo `papel` enviado no corpo é ignorado.

**Corpo da requisição**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `nome` | texto | sim | 2 a 100 caracteres |
| `email` | texto | sim | e-mail válido, até 150 caracteres. Guardado em minúsculas |
| `senha` | texto | sim | 8 a 72 caracteres |

```json
{ "nome": "Maria Souza", "email": "maria@exemplo.com", "senha": "minhasenha123" }
```

**Resposta 201**
```json
{
  "usuario": {
    "id": 5,
    "nome": "Maria Souza",
    "email": "maria@exemplo.com",
    "papel": "usuario",
    "criado_em": "2026-11-23T10:15:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:** `400` dados inválidos · `409` e-mail já cadastrado.

---

### `POST /api/auth/login`

- **Acesso:** 🌐 Pública
- **Finalidade:** autenticar com e-mail e senha e receber o token JWT.

**Corpo da requisição**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `email` | texto | sim | não diferencia maiúsculas de minúsculas |
| `senha` | texto | sim | |

```json
{ "email": "maria@agonhub.example", "senha": "Senha@123" }
```

**Resposta 200**
```json
{
  "usuario": { "id": 2, "nome": "Maria Souza", "email": "maria@agonhub.example", "papel": "usuario" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:** `400` faltou e-mail ou senha · `401` e-mail ou senha inválidos (a mesma mensagem nos dois casos, de propósito).

---

### `GET /api/auth/me`

- **Acesso:** 🔒 Logado
- **Finalidade:** devolver os dados do usuário dono do token (usado pelo frontend para saber quem está logado).
- **Parâmetros:** nenhum.

**Resposta 200**
```json
{
  "usuario": { "id": 2, "nome": "Maria Souza", "email": "maria@agonhub.example", "papel": "usuario" }
}
```

**Erros:** `401` token ausente, inválido ou expirado.

---

## Usuários

### `GET /api/usuarios`

- **Acesso:** 🔒👑 Admin
- **Finalidade:** listar todas as contas cadastradas. O hash da senha nunca é devolvido.
- **Parâmetros:** nenhum.

**Resposta 200**
```json
[
  { "id": 1, "nome": "Redação AGON", "email": "redacao@agonhub.example", "papel": "usuario", "criado_em": "2026-11-23T10:00:00.000Z" },
  { "id": 2, "nome": "Maria Souza", "email": "maria@agonhub.example", "papel": "usuario", "criado_em": "2026-11-23T10:00:00.000Z" }
]
```

**Erros:** `401` não autenticado · `403` usuário logado, mas não é administrador.

---

## Modalidades

Esportes (`tipo: esporte`) e jogos eletrônicos (`tipo: esport`).

### `GET /api/modalidades`

- **Acesso:** 🌐 Pública
- **Finalidade:** listar as modalidades, em ordem alfabética.
- **Parâmetros:** nenhum.

**Resposta 200**
```json
[
  { "id": 2, "nome": "Futsal", "tipo": "esporte", "descricao": "Futebol de salão..." },
  { "id": 11, "nome": "Valorant", "tipo": "esport", "descricao": "Jogo eletrônico..." }
]
```

### `GET /api/modalidades/:id`

- **Acesso:** 🌐 Pública
- **Parâmetros de URL:** `id` (número inteiro).

**Resposta 200**
```json
{ "id": 2, "nome": "Futsal", "tipo": "esporte", "descricao": "Futebol de salão..." }
```

**Erros:** `400` id inválido · `404` modalidade não encontrada.

### `POST /api/modalidades`

- **Acesso:** 🔒👑 Admin
- **Corpo da requisição**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `nome` | texto | sim | 2 a 80 caracteres, único |
| `tipo` | texto | sim | `esporte` ou `esport` |
| `descricao` | texto | não | até 500 caracteres |

```json
{ "nome": "Xadrez", "tipo": "esporte", "descricao": "Jogo de estratégia." }
```

**Resposta 201**
```json
{ "id": 15, "nome": "Xadrez", "tipo": "esporte", "descricao": "Jogo de estratégia." }
```

**Erros:** `400` dados inválidos (com `detalhes`) · `401` · `403` · `409` nome já existe.

### `PUT /api/modalidades/:id`

- **Acesso:** 🔒👑 Admin
- **Corpo:** os mesmos campos do POST (todos).
- **Resposta 200:** a modalidade já alterada.
- **Erros:** `400` · `401` · `403` · `404` · `409`.

### `DELETE /api/modalidades/:id`

- **Acesso:** 🔒👑 Admin
- **Finalidade:** excluir a modalidade. Não é possível se houver equipes usando-a.

**Resposta 200**
```json
{ "mensagem": "Modalidade excluída." }
```

**Erros:** `401` · `403` · `404` · `409` modalidade em uso por equipes.

---

## Equipes

Equipes reais (`tipo: real`) ou fictícias (`tipo: ficticia`). Cada equipe pertence a uma modalidade.

### `GET /api/equipes`

- **Acesso:** 🌐 Pública
- **Finalidade:** listar todas as equipes, com o nome e o tipo da modalidade.
- **Parâmetros:** nenhum.

**Resposta 200**
```json
[
  {
    "id": 1,
    "nome": "Falcões do Norte",
    "sigla": "FDN",
    "tipo": "ficticia",
    "instituicao": null,
    "descricao": "Equipe fictícia de futsal...",
    "logo_url": null,
    "modalidade_id": 2,
    "modalidade_nome": "Futsal",
    "modalidade_tipo": "esporte"
  }
]
```

### `GET /api/equipes/:id`

- **Acesso:** 🌐 Pública
- **Finalidade:** uma equipe, com a modalidade e a lista de atletas (tabela `equipe_atletas`).
- **Parâmetros de URL:** `id` (número inteiro).

**Resposta 200**
```json
{
  "id": 1,
  "nome": "Falcões do Norte",
  "sigla": "FDN",
  "tipo": "ficticia",
  "instituicao": null,
  "descricao": "Equipe fictícia de futsal...",
  "logo_url": null,
  "modalidade_id": 2,
  "modalidade_nome": "Futsal",
  "modalidade_tipo": "esporte",
  "atletas": [
    { "id": 1, "nome": "Maria Souza", "apelido": "Mari", "funcao": "Ala" },
    { "id": 2, "nome": "Bruno Teles", "apelido": "Brunão", "funcao": "Fixo" }
  ]
}
```

**Erros:** `400` id inválido · `404` equipe não encontrada.

### `POST /api/equipes`

- **Acesso:** 🔒👑 Admin
- **Finalidade:** cadastrar uma equipe. Grava no PostgreSQL e devolve a equipe já com a modalidade.

**Corpo da requisição**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `nome` | texto | sim | 2 a 100 caracteres, único |
| `sigla` | texto | sim | 2 a 10 letras ou números, sem espaços; é guardada em maiúsculas; única |
| `tipo` | texto | sim | `real` ou `ficticia` |
| `modalidade_id` | número | sim | id de uma modalidade existente |
| `instituicao` | texto | não | até 150 caracteres |
| `descricao` | texto | não | até 1000 caracteres |
| `logo_url` | texto | não | URL que começa com `http://` ou `https://` (até 255 caracteres) |

```json
{
  "nome": "Equipe Exemplo",
  "sigla": "EXE",
  "tipo": "real",
  "modalidade_id": 2,
  "instituicao": "Instituto Federal",
  "descricao": "Equipe criada pela banca.",
  "logo_url": null
}
```

**Resposta 201**
```json
{
  "id": 9,
  "nome": "Equipe Exemplo",
  "sigla": "EXE",
  "tipo": "real",
  "instituicao": "Instituto Federal",
  "descricao": "Equipe criada pela banca.",
  "logo_url": null,
  "modalidade_id": 2,
  "modalidade_nome": "Futsal",
  "modalidade_tipo": "esporte",
  "atletas": []
}
```

**Erros:** `400` dados inválidos (com `detalhes`), ou modalidade inexistente · `401` sem token · `403` não é admin · `409` nome ou sigla já existem (com mensagem dizendo qual).

### `PUT /api/equipes/:id`

- **Acesso:** 🔒👑 Admin
- **Corpo:** os mesmos campos do POST (todos).
- **Resposta 200:** a equipe já alterada, no mesmo formato do GET /:id.
- **Erros:** `400` · `401` · `403` · `404` · `409`.

### `DELETE /api/equipes/:id`

- **Acesso:** 🔒👑 Admin
- **Finalidade:** excluir a equipe. Os vínculos com atletas e campeonatos são removidos junto. Se a equipe já tiver partidas, a exclusão é recusada.

**Resposta 200**
```json
{ "mensagem": "Equipe excluída." }
```

**Erros:** `401` · `403` · `404` · `409` equipe usada em partidas.

> **Ainda não implementado nesta versão:** atletas (CRUD e vínculo com equipes), campeonatos, partidas, notícias, upload de imagens (por enquanto o logo é informado como URL) e o cadastro de equipes em campeonatos.
