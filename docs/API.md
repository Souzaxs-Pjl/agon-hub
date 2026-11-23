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
