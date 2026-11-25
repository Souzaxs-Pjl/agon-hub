# Guia do apresentador — AGON Hub

Este guia serve para estudar o código e preparar a defesa. O objetivo é entender o fluxo e conseguir explicar as decisões, não decorar frases.

## 1. O que é o AGON Hub

O AGON Hub é uma aplicação web para consultar e administrar informações de esportes tradicionais e e-sports. Ele reúne modalidades, equipes, atletas, campeonatos, partidas e notícias.

A aplicação possui três partes:
1. **Frontend:** React, que mostra páginas e formulários.
2. **Backend:** Node.js + Express, que oferece a API REST e aplica regras e permissões.
3. **Banco:** PostgreSQL, que guarda os dados e mantém os relacionamentos.

O navegador não acessa o PostgreSQL diretamente. Ele envia requisições HTTP ao backend, e o backend conversa com o banco.

## 2. Como uma requisição funciona

Exemplo: o administrador cadastra uma equipe.

1. O administrador preenche o formulário no React.
2. O frontend chama a função `api()` em `frontend/src/api.js`.
3. A função envia `POST /api/equipes`, normalmente com JSON e token JWT.
4. O Express recebe a requisição em `backend/src/server.js` e encaminha para `backend/src/routes/equipes.js`.
5. O middleware verifica se o token é válido e se o usuário é administrador.
6. A rota valida os campos e executa uma consulta SQL parametrizada usando `pg`.
7. O PostgreSQL grava a equipe e devolve os dados.
8. A API responde com HTTP 201 e o frontend atualiza a listagem.

## 3. Arquivos principais

- `backend/src/server.js`: configura Express, CORS, JSON, arquivos estáticos, rotas e tratamento de erros.
- `backend/src/db.js`: cria e exporta a conexão/pool PostgreSQL.
- `backend/src/validacao.js`: valida campos e IDs antes de acessar o banco.
- `backend/src/middlewares/auth.js`: gera e verifica JWT, autentica e exige papel administrativo.
- `backend/src/middlewares/erros.js`: transforma erros em respostas HTTP consistentes.
- `backend/src/routes/`: rotas separadas por recurso.
- `frontend/src/App.jsx`: define páginas e URLs do React Router.
- `frontend/src/AuthContext.jsx`: mantém usuário, token, login, cadastro e logout no estado do frontend.
- `frontend/src/api.js`: centraliza chamadas HTTP e adiciona o token quando existe.
- `frontend/src/pages/Admin.jsx`: painel administrativo de equipes.
- `frontend/src/pages/AdminRecursos.jsx`: painel reutilizável para modalidades, atletas, campeonatos, partidas e notícias.
- `frontend/src/pages/ConsultaPublica.jsx`: listagens públicas dos recursos.
- `frontend/src/pages/EquipeDetalhe.jsx`: detalhe público de equipe e seus atletas.
- `frontend/src/index.css`: estilos, paleta e regras responsivas.

## 4. O que significa CRUD

CRUD representa quatro operações:
- **Create:** criar registro — normalmente HTTP POST.
- **Read:** consultar registro — HTTP GET.
- **Update:** atualizar registro — HTTP PUT.
- **Delete:** excluir registro — HTTP DELETE.

No AGON Hub, o painel administrativo permite gerenciar os recursos. As rotas públicas de leitura permitem que visitantes consultem os dados.

## 5. Login e segurança

1. No cadastro, o backend valida nome, e-mail e senha.
2. A senha é transformada em hash com bcrypt; a senha original não é armazenada.
3. No login, bcrypt compara a senha digitada com o hash do banco.
4. Se as credenciais estiverem corretas, o backend emite um JWT assinado.
5. O frontend guarda o token localmente e o envia no cabeçalho `Authorization: Bearer <token>`.
6. Nas rotas administrativas, o backend valida o token e consulta o papel atual no banco.

**Autenticação** responde “quem é o usuário?”. **Autorização** responde “o que ele pode fazer?”. Esconder o botão no frontend não é suficiente: a permissão precisa ser aplicada na API.

O logout desta versão remove o token local do navegador; não existe endpoint de logout no servidor.

## 6. Como entender o banco

O banco tem nove tabelas:
- `usuarios`: contas de acesso.
- `modalidades`: esportes e e-sports.
- `equipes`: equipes com modalidade principal.
- `atletas`: dados da pessoa atleta.
- `equipe_atletas`: relação entre equipe e atleta, com função.
- `campeonatos`: edições de competições.
- `campeonato_equipes`: relação de inscrição de equipes.
- `partidas`: confrontos, placares e status.
- `noticias`: conteúdo editorial.

Uma relação **1:N** significa que um registro pode se relacionar com vários registros do outro lado. Exemplo: uma modalidade pode ter várias equipes.

Uma relação **N:N** significa vários para vários. Exemplo: uma equipe tem vários atletas e um atleta pode estar em mais de uma equipe. A tabela `equipe_atletas` guarda essa associação e a função do atleta.

Chaves primárias identificam registros. Chaves estrangeiras garantem que relações apontem para registros existentes. Restrições `UNIQUE` evitam duplicidades e `CHECK` limitam valores permitidos.

## 7. Como funciona o upload

O administrador envia um arquivo pelo formulário. O frontend usa `FormData` e não monta JSON para o arquivo.

A rota de upload usa Multer para receber o arquivo, limita o tamanho a 5 MB, aceita JPEG, PNG e WebP, verifica a assinatura do arquivo e exige administrador. O backend gera um nome aleatório, grava o arquivo na pasta de uploads e atualiza `logo_url` ou `foto_url` no PostgreSQL. O Express disponibiliza os arquivos pela rota `/uploads`.

O banco guarda o caminho da imagem, não o conteúdo binário. Em hospedagens com disco temporário, os arquivos podem desaparecer após reinicialização; para publicação, é necessário disco persistente ou armazenamento externo.

## 8. SQL e dados demonstrativos

`schema.sql` cria as tabelas se elas ainda não existirem. Ele não é um sistema de migrações: mudanças em tabelas existentes exigem scripts de alteração específicos.

`seed.sql` insere dados fictícios para testar e apresentar. Partidas demonstrativas são marcadas com `demonstrativo = TRUE`. Não apresente esses resultados como oficiais.

## 9. Testes

O backend usa `node:test`. O GitHub Actions cria um PostgreSQL temporário, prepara o banco, cria um administrador de teste e executa a suíte. Na execução #29, foram aprovados 77 testes e o build do frontend também passou.

O CI confirma os testes automatizados na revisão atual. Ainda é necessário conferir manualmente a interface no navegador e capturar evidências para o relatório.

## 10. Perguntas comuns da banca

**Por que não conectar React diretamente ao PostgreSQL?**  
Porque o banco não deve ficar exposto ao navegador. A API centraliza validação, autenticação, autorização e consultas.

**Por que usar tabelas associativas?**  
Para representar relações N:N e guardar atributos do vínculo, como a função do atleta na equipe.

**Por que usar consultas parametrizadas?**  
Para separar os valores do usuário do texto SQL e reduzir o risco de SQL injection.

**O que são HTTP 401 e 403?**  
401 significa que a requisição não está autenticada; 403 significa que o usuário está autenticado, mas não tem permissão.

**O que é HTTP 201?**  
Indica que um recurso foi criado com sucesso.

**O que o GitHub Actions testou?**  
Executou os testes automatizados do backend com PostgreSQL temporário e compilou o frontend. Não substitui a avaliação visual manual.

**Qual é uma limitação atual?**  
Os arquivos de upload são armazenados no disco do backend. Em uma hospedagem com armazenamento efêmero, é necessário configurar armazenamento persistente para não perder imagens.

## 11. Como estudar

Para cada arquivo, tente responder:
1. Qual é a responsabilidade dele?
2. Quem chama esse arquivo?
3. Quais dados ele recebe?
4. O que ele devolve ou altera?
5. Que erro pode acontecer?

Comece por `App.jsx`, `api.js`, `server.js`, `routes/equipes.js` e `middlewares/auth.js`; depois acompanhe o formulário de equipe até o banco. Esse fluxo explica a arquitetura inteira com um exemplo concreto.
