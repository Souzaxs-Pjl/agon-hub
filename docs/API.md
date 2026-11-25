# Documentação da API — AGON Hub

API REST desenvolvida com Node.js e Express. As rotas usam o prefixo `/api` e retornam JSON, exceto os endpoints de envio de imagem, que recebem `multipart/form-data`.

**URL local:** `http://localhost:3000`  
**Frontend local:** `http://localhost:5173`

## 1. Autenticação e permissões

As rotas administrativas exigem o cabeçalho:

```http
Authorization: Bearer <token>
```

O token JWT é obtido por `POST /api/auth/login` ou `POST /api/auth/register`. A validade padrão é de duas horas e pode ser configurada por `JWT_EXPIRES_IN`.

| Acesso | Significado |
|---|---|
| Público | Pode ser chamado sem login |
| Administrador | Exige token válido e papel `admin` |

O backend valida o token e consulta o papel atual do usuário no banco. O campo de papel enviado pelo cliente não concede privilégios.

## 2. Respostas HTTP

| HTTP | Significado |
|---|---|
| 200 | Operação concluída |
| 201 | Registro criado ou imagem recebida |
| 400 | Dados ou identificadores inválidos |
| 401 | Token ausente, inválido ou expirado |
| 403 | Usuário autenticado sem permissão administrativa |
| 404 | Registro ou rota não encontrado |
| 409 | Conflito de unicidade ou integridade |
| 413 | Arquivo ou corpo maior que o limite |
| 500 | Erro interno não previsto |

Exemplo de erro:

```json
{
  "erro": "Dados inválidos.",
  "detalhes": ["O nome deve ter entre 2 e 100 caracteres."]
}
```

## 3. Saúde

### `GET /api/saude`

- Acesso: público.
- Verifica a API e a conexão com PostgreSQL.

Resposta 200:

```json
{ "status": "ok", "banco": "ok" }
```

Resposta 503 quando a consulta ao banco falhar:

```json
{ "status": "erro", "banco": "indisponivel" }
```

## 4. Autenticação e usuários

### `POST /api/auth/register`

- Acesso: público.
- Cria sempre uma conta com papel `usuario`.

Corpo:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nome` | texto | Sim | 2–100 caracteres |
| `email` | texto | Sim | e-mail válido, até 150 caracteres |
| `senha` | texto | Sim | mínimo 8 caracteres e máximo de 72 bytes |

Resposta 201: objeto `usuario` e token. Erros: 400 dados inválidos; 409 e-mail já cadastrado.

### `POST /api/auth/login`

- Acesso: público.
- Confere e-mail e senha e devolve usuário e token JWT.
- Erros: 400 quando faltam dados; 401 quando as credenciais não conferem.

### `GET /api/auth/me`

- Acesso: usuário autenticado.
- Devolve os dados do usuário associado ao token.

### `GET /api/usuarios`

- Acesso: administrador.
- Lista contas sem expor `senha_hash`.

## 5. Modalidades

Os valores aceitos em `tipo` são `esporte` e `esport` (valor interno utilizado para jogos eletrônicos).

### `GET /api/modalidades`
- Acesso: público. Lista todas as modalidades.

### `GET /api/modalidades/:id`
- Acesso: público. Consulta uma modalidade pelo ID.

### `POST /api/modalidades`
- Acesso: administrador.
- Campos: `nome` (2–80), `tipo` (`esporte` ou `esport`) e `descricao` (opcional, até 500).

### `PUT /api/modalidades/:id`
- Acesso: administrador.
- Atualiza nome, tipo e descrição; envie os campos completos.

### `DELETE /api/modalidades/:id`
- Acesso: administrador.
- Exclui uma modalidade sem equipes ou campeonatos dependentes. Se estiver em uso, a API responde 409.

## 6. Equipes

Cada equipe possui uma modalidade principal obrigatória.

### `GET /api/equipes`
- Acesso: público. Lista equipes com dados da modalidade.

### `GET /api/equipes/:id`
- Acesso: público. Consulta a equipe e os atletas vinculados.
- Cada atleta contém `id`, `nome`, `apelido` e `funcao`.

### `POST /api/equipes`
- Acesso: administrador.
- Obrigatórios: `nome`, `sigla`, `tipo`, `modalidade_id`.
- Opcionais: `instituicao`, `descricao`, `logo_url`.
- `tipo`: `real` ou `ficticia`.
- `sigla`: de 2 a 10 letras ou números; gravada em maiúsculas.
- `logo_url`: URL HTTP/HTTPS ou caminho local retornado pelo upload.

### `PUT /api/equipes/:id`
- Acesso: administrador. Atualiza os dados da equipe; envie os campos completos.

### `DELETE /api/equipes/:id`
- Acesso: administrador.
- Exclui a equipe quando não há partidas que impeçam a operação. Vínculos associativos são removidos por cascata.

## 7. Atletas

A tabela `atletas` representa pessoas. O vínculo com uma conta em `usuarios` é opcional.

### `GET /api/atletas`
- Acesso: público. Lista atletas e, quando houver, o nome da conta associada.

### `GET /api/atletas/:id`
- Acesso: público. Devolve o atleta e as equipes vinculadas, incluindo função.

### `POST /api/atletas`
- Acesso: administrador.
- Obrigatório: `nome` (2–100).
- Opcionais: `apelido` (até 50), `bio` (até 5.000), `foto_url`, `usuario_id`.

### `PUT /api/atletas/:id`
- Acesso: administrador. Atualiza os campos do atleta.

### `DELETE /api/atletas/:id`
- Acesso: administrador. Exclui o atleta e seus vínculos em `equipe_atletas`.

### `POST /api/atletas/:id/equipes`
- Acesso: administrador.
- Cria vínculo N:N entre atleta e equipe.
- Corpo: `{ "equipe_id": 1, "funcao": "Ala" }`.
- Resposta 201: atleta atualizado, incluindo a lista de equipes.

### `PUT /api/atletas/:id/equipes/:equipeId`
- Acesso: administrador.
- Atualiza a função do atleta naquela equipe.
- Corpo: `{ "funcao": "Pivô" }`.

### `DELETE /api/atletas/:id/equipes/:equipeId`
- Acesso: administrador. Remove somente aquele vínculo.

## 8. Campeonatos

### `GET /api/campeonatos`
- Acesso: público. Lista campeonatos com modalidade e total de equipes inscritas.

### `GET /api/campeonatos/:id`
- Acesso: público. Consulta campeonato e equipes inscritas.

### `POST /api/campeonatos`
- Acesso: administrador.
- Campos: `nome` (2–120), `edicao` (ano de 1900 a 2200), `modalidade_id`, `data_inicio`, `data_fim`, `status`, `descricao`.
- Datas: `AAAA-MM-DD`.
- Status: `planejado`, `em_andamento`, `encerrado`.
- A data final não pode anteceder a data inicial.

### `PUT /api/campeonatos/:id`
- Acesso: administrador. Atualiza os campos do campeonato.

### `DELETE /api/campeonatos/:id`
- Acesso: administrador. Exclui o campeonato; partidas e inscrições associadas são removidas por cascata no banco.

### `POST /api/campeonatos/:id/equipes`
- Acesso: administrador.
- Inscreve equipe no campeonato.
- Corpo: `{ "equipe_id": 1 }`.
- A equipe precisa existir e pertencer à mesma modalidade do campeonato.
- Resposta 201: campeonato atualizado com suas equipes.

### `DELETE /api/campeonatos/:id/equipes/:equipeId`
- Acesso: administrador. Remove a inscrição da equipe.

## 9. Partidas

Uma partida precisa referenciar campeonato, equipe mandante e equipe visitante existentes. As equipes devem estar inscritas no campeonato e pertencer à mesma modalidade da competição.

### `GET /api/partidas`
- Acesso: público. Lista partidas.
- Filtro opcional: `?campeonato_id=1`.

### `GET /api/partidas/:id`
- Acesso: público. Consulta uma partida.

### `POST /api/partidas`
- Acesso: administrador.
- Campos: `campeonato_id`, `equipe_casa_id`, `equipe_visitante_id`, `data_hora`, `fase`, `placar_casa`, `placar_visitante`, `status`, `demonstrativo`.
- Status: `agendada`, `em_andamento`, `finalizada`.
- As equipes mandante e visitante devem ser diferentes.
- Placares: inteiros entre 0 e 999; informe os dois ou deixe ambos vazios.
- Partida finalizada exige os dois placares.
- `demonstrativo` é booleano e, quando omitido, assume `false`.

### `PUT /api/partidas/:id`
- Acesso: administrador. Atualiza os campos da partida, mantendo as regras de validação.

### `DELETE /api/partidas/:id`
- Acesso: administrador. Exclui a partida.

## 10. Notícias

### `GET /api/noticias`
- Acesso: público. Lista notícias da mais recente para a mais antiga.

### `GET /api/noticias/:id`
- Acesso: público. Consulta uma notícia.

### `POST /api/noticias`
- Acesso: administrador.
- Campos: `titulo` (3–200), `resumo` (opcional, até 300), `conteudo` (1–20.000) e `imagem_url` (opcional).
- O autor é definido pelo administrador autenticado, não pelo cliente.

### `PUT /api/noticias/:id`
- Acesso: administrador. Atualiza título, resumo, conteúdo e imagem.

### `DELETE /api/noticias/:id`
- Acesso: administrador. Exclui a notícia.

## 11. Upload de imagens

Os endpoints recebem arquivo em `multipart/form-data`, no campo `imagem`, e exigem administrador autenticado.

| Endpoint | Campo atualizado |
|---|---|
| `POST /api/uploads/equipes/:id/logo` | `equipes.logo_url` |
| `POST /api/uploads/atletas/:id/foto` | `atletas.foto_url` |

Regras:
- Formatos: JPEG, PNG e WebP.
- Limite: 5 MB por arquivo.
- O backend confere a assinatura binária do arquivo.
- Os arquivos são gravados em `backend/uploads`.
- A URL retornada começa com `/uploads/` e pode ser aberta por HTTP.

Exemplo:

```js
const formulario = new FormData();
formulario.append('imagem', arquivoSelecionado);

const resposta = await fetch('/api/uploads/equipes/1/logo', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formulario,
});
```

Não defina manualmente `Content-Type` ao enviar `FormData`; o navegador inclui o boundary multipart. Os campos de imagem também aceitam URLs HTTP/HTTPS.

## 12. Observações

- As rotas de escrita são administrativas.
- As rotas de consulta listadas como públicas não exigem token.
- O frontend deve tratar erros HTTP e falhas de comunicação separadamente.
- Não há endpoint de logout no backend; o frontend encerra a sessão removendo o token local.
- Esta documentação descreve os contratos atuais da API. As telas devem ser integradas a esses caminhos e campos.
