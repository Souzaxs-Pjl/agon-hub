# Plano de testes — AGON Hub

Este documento separa os testes já presentes no repositório dos testes que ainda precisam ser acrescentados. Um caso só deve ser marcado como **Aprovado** depois de ser executado e ter seu resultado registrado.

## 1. Estado conhecido dos testes

| Área | Testes existentes | Estado de execução nesta revisão |
|---|---|---|
| Cadastro/login/JWT | `backend/tests/auth.test.js` | Não executados nesta sessão |
| Validação de modalidades/equipes | Testes unitários em `backend/tests` | Não executados nesta sessão |
| CRUD de equipes | `backend/tests/equipes.test.js` | Não executados nesta sessão |
| CRUD de modalidades | Verificar cobertura automatizada | Não executados nesta sessão |
| Atletas, campeonatos, partidas, notícias e uploads | `backend/tests/recursos.test.js` | Implementados; execução pendente de confirmação |
| Telas públicas e administrativas | Testes manuais de navegador | Pendente |
| Build do frontend | `npm run build` e workflow CI | Implementado no workflow; resultado precisa ser conferido |

## 2. Preparação do ambiente de teste

1. Instalar Node.js 18 ou superior, npm e PostgreSQL.
2. Criar um banco exclusivo para testes, preferencialmente `agon_hub_test`.
3. Aplicar `database/schema.sql` e `database/seed.sql` nesse banco de teste.
4. Configurar `backend/.env` com as credenciais desse banco, um `JWT_SECRET` de desenvolvimento e os dados do administrador.
5. Executar `npm install` em `backend` e `frontend`.
6. Criar o administrador com `npm run criar-admin`.
7. Iniciar o backend com `npm run dev` e o frontend com `npm run dev`, em terminais separados.

**Importante:** nunca execute testes destrutivos ou o `schema.sql` no banco que contém dados que precisam ser preservados.

## 3. Matriz de testes funcionais

### 3.1. Saúde e autenticação

| ID | Ação | Resultado esperado |
|---|---|---|
| AUT-01 | Consultar `GET /api/saude` com API e banco ativos | HTTP 200 e `banco: ok` |
| AUT-02 | Consultar uma rota inexistente | HTTP 404 |
| AUT-03 | Cadastrar uma conta com dados válidos | HTTP 201 e token JWT |
| AUT-04 | Tentar cadastrar e-mail duplicado | HTTP 409 |
| AUT-05 | Tentar cadastrar com senha menor que o mínimo | HTTP 400 |
| AUT-06 | Tentar enviar `papel: admin` no cadastro público | Conta criada como `usuario` |
| AUT-07 | Entrar com credenciais corretas | HTTP 200 e token |
| AUT-08 | Entrar com senha errada | HTTP 401 |
| AUT-09 | Consultar `/api/auth/me` sem token | HTTP 401 |
| AUT-10 | Consultar `/api/auth/me` com token válido | HTTP 200 e dados do usuário |
| AUT-11 | Acessar recurso administrativo como usuário comum | HTTP 403 |
| AUT-12 | Acessar recurso administrativo como admin | Acesso permitido |
| AUT-13 | Sair pelo frontend e atualizar a página | Token removido e sessão encerrada no navegador |

### 3.2. Modalidades e equipes

| ID | Ação | Resultado esperado |
|---|---|---|
| MOD-01 | Listar modalidades sem login | HTTP 200 |
| MOD-02 | Consultar modalidade inexistente | HTTP 404 |
| MOD-03 | Admin criar modalidade válida | HTTP 201 |
| MOD-04 | Usuário comum tentar criar modalidade | HTTP 403 |
| MOD-05 | Admin editar modalidade | HTTP 200 |
| MOD-06 | Excluir modalidade em uso por equipe/campeonato | HTTP 409 |
| MOD-07 | Admin excluir modalidade sem dependências | HTTP 200 |
| EQP-01 | Listar equipes sem login | HTTP 200 |
| EQP-02 | Consultar detalhe com atletas | Dados da equipe e vínculos |
| EQP-03 | Admin criar equipe com modalidade válida | HTTP 201 |
| EQP-04 | Tentar criar equipe com modalidade inexistente | HTTP 400 |
| EQP-05 | Admin editar equipe | HTTP 200 |
| EQP-06 | Admin excluir equipe sem dependências restritivas | HTTP 200 |
| EQP-07 | Usuário comum tentar alterar equipe | HTTP 403 |
| EQP-08 | Tentar excluir equipe usada em partida | HTTP 409 |

### 3.3. Atletas e vínculos

| ID | Ação | Resultado esperado |
|---|---|---|
| ATL-01 | Listar atletas publicamente | HTTP 200 |
| ATL-02 | Admin cadastrar atleta válido | HTTP 201 |
| ATL-03 | Admin editar atleta | HTTP 200 |
| ATL-04 | Admin excluir atleta | HTTP 200, observando vínculos |
| ATL-05 | Vincular atleta a equipe com função | Relação salva em `equipe_atletas` |
| ATL-06 | Vincular o mesmo atleta à mesma equipe duas vezes | Conflito tratado sem duplicidade |
| ATL-07 | Consultar equipe | Nome, apelido e função dos atletas vinculados |
| ATL-08 | Usuário não administrador tentar cadastrar/alterar | HTTP 403 |

### 3.4. Campeonatos e inscrições

| ID | Ação | Resultado esperado |
|---|---|---|
| CMP-01 | Listar campeonatos | HTTP 200 |
| CMP-02 | Admin criar campeonato com modalidade válida | HTTP 201 |
| CMP-03 | Rejeitar intervalo de datas inválido | HTTP 400 |
| CMP-04 | Admin editar campeonato | HTTP 200 |
| CMP-05 | Admin excluir campeonato | HTTP 200, com comportamento de dependências documentado |
| CMP-06 | Inscrever equipe em campeonato | Relação gravada em `campeonato_equipes` |
| CMP-07 | Tentar duplicar inscrição | Conflito tratado |
| CMP-08 | Exibir equipes inscritas no detalhe | Lista correspondente ao banco |

### 3.5. Partidas e resultados

| ID | Ação | Resultado esperado |
|---|---|---|
| PAR-01 | Listar partidas | HTTP 200 |
| PAR-02 | Admin criar partida com campeonato e equipes existentes | HTTP 201 |
| PAR-03 | Informar a mesma equipe nos dois lados | HTTP 400 |
| PAR-04 | Informar placar negativo | HTTP 400 |
| PAR-05 | Finalizar partida sem placar completo | HTTP 400 |
| PAR-06 | Admin editar partida/placar | HTTP 200 |
| PAR-07 | Filtrar partidas por campeonato | Apenas partidas do campeonato |
| PAR-08 | Excluir partida | HTTP 200 |

### 3.6. Notícias e uploads

| ID | Ação | Resultado esperado |
|---|---|---|
| NOT-01 | Consultar notícias publicadas | HTTP 200 |
| NOT-02 | Admin criar notícia | HTTP 201 |
| NOT-03 | Admin editar notícia | HTTP 200 |
| NOT-04 | Admin excluir notícia | HTTP 200 |
| UP-01 | Enviar imagem raster permitida dentro do limite | Arquivo armazenado e URL retornada |
| UP-02 | Enviar arquivo PDF ou executável | Rejeitado |
| UP-03 | Enviar imagem acima do limite | HTTP 413 ou erro equivalente documentado |
| UP-04 | Usuário comum tentar enviar imagem | HTTP 403 |
| UP-05 | Abrir URL de imagem armazenada | Arquivo servido pelo backend |

### 3.7. Frontend e integração

| ID | Ação | Resultado esperado |
|---|---|---|
| FE-01 | Abrir página inicial | Conteúdo carregado sem erro |
| FE-02 | Navegar entre páginas | Rotas funcionam sem recarregamento indevido |
| FE-03 | Acessar painel sem login | Mensagem de autenticação necessária |
| FE-04 | Acessar painel como usuário comum | Mensagem de acesso negado |
| FE-05 | Administrar um registro | Alteração refletida na lista pública |
| FE-06 | Atualizar a página após login | Sessão recuperada via `/api/auth/me` |
| FE-07 | Abrir em viewport móvel | Layout utilizável sem rolagem horizontal indevida |
| FE-08 | API indisponível | Interface informa falha de comunicação sem afirmar causa não confirmada |
| FE-09 | Criar/editar/excluir modalidade, atleta, campeonato, partida e notícia | A operação aparece na lista após resposta de sucesso |
| FE-10 | Criar/remover vínculo atleta-equipe | A função e a equipe aparecem no detalhe do atleta e da equipe |
| FE-11 | Inscrever/remover equipe em campeonato | A lista de equipes inscritas é atualizada |
| FE-12 | Enviar logo e foto | Upload aceito e imagem exibida após recarregar o registro |
| FE-13 | Abrir as páginas públicas dos módulos | A página carrega registros vindos da API |

## 4. Testes automatizados e execução

### Arquivos de teste existentes

- `backend/tests/auth.test.js`: saúde, cadastro, login, token JWT, sessão e autorização.
- `backend/tests/equipes.test.js`: leitura pública e CRUD de equipes, incluindo permissões e validação.
- `backend/tests/recursos.test.js`: CRUD de modalidades, atletas, campeonatos, partidas e notícias; vínculos, permissões e uploads.
- Outros testes unitários em `backend/tests` cobrem funções de validação.

### Execução remota pelo GitHub Actions

O arquivo `.github/workflows/ci.yml` prepara um serviço PostgreSQL temporário, instala dependências, aplica `schema.sql` e `seed.sql`, cria um administrador de teste, inicia a API, executa `npm test` e gera o build do frontend.

Para conferir o resultado:
1. Abra o repositório no GitHub.
2. Acesse a aba **Actions**.
3. Abra o workflow **Validar AGON Hub**.
4. Confira os jobs `backend` e `frontend`.
5. Se houver falha, abra o job e examine a etapa em vermelho e seus logs.

Um workflow criado no repositório não significa, por si só, que foi executado ou aprovado. Registre o resultado real nesta documentação.



### Backend

Na pasta `backend`:

```bash
npm test
```

O projeto utiliza o módulo nativo `node:test`. Testes de integração dependem de API e PostgreSQL ativos. Os testes que usam administrador dependem de `ADMIN_EMAIL` e `ADMIN_SENHA` configurados.

### Frontend

Na pasta `frontend`:

```bash
npm run build
```

O comando verifica se o Vite consegue compilar a aplicação para produção. Build bem-sucedido não substitui teste manual no navegador.

## 5. Registro de resultados

Preencher esta tabela somente após executar os testes:

| Data | ID ou conjunto | Resultado | Evidência/observação |
|---|---|---|---|
| [data] | [IDs] | [Aprovado/Reprovado/Pendente] | [print, log ou observação] |

## 6. Critério de conclusão

A entrega só deve ser considerada validada quando:

- Todos os fluxos críticos de autenticação e autorização forem testados.
- Cada CRUD implementado passar por criação, leitura, atualização e exclusão.
- Restrições de integridade do banco forem respeitadas.
- Uploads aceitarem apenas formatos e tamanhos previstos.
- O frontend construir sem erros e os fluxos principais forem demonstrados no navegador.
- Falhas conhecidas e funcionalidades pendentes estiverem documentadas.
