# AGON Hub

> **"Mais que competição, um universo."**

O **AGON Hub** é uma plataforma web que funciona como um ecossistema digital esportivo e de e-sports do Universo AGON. Ela reúne, em um único site, informações sobre equipes, atletas, modalidades, campeonatos, partidas, resultados e notícias.

> ⚠️ **Dados demonstrativos:** todas as equipes, atletas, placares e notícias que vêm no banco de dados (`database/seed.sql`) são **fictícios**, criados apenas para testar o sistema. As partidas de exemplo estão marcadas com `demonstrativo = TRUE`.

## Objetivo

Desenvolver uma aplicação web funcional, com **frontend, backend e banco de dados integrados**, permitindo:

- consultar equipes, atletas, modalidades, campeonatos, partidas e notícias;
- cadastrar-se e fazer login (autenticação com JWT);
- gerenciar o conteúdo por meio de uma área administrativa (apenas administradores).

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Banco de dados | PostgreSQL |
| Backend | Node.js + Express (API REST) |
| Autenticação | JWT + bcrypt |
| Upload de arquivos | multer |
| Frontend | React (Vite) + React Router + Tailwind CSS |
| Versionamento | Git e GitHub |

## Escopo da primeira versão (MVP)

**Incluído**

- Equipes, atletas, campeonatos, partidas e notícias (CRUD completo).
- Modalidades esportivas e jogos eletrônicos (diferenciados pelo campo `tipo`).
- Cadastro, login e dois papéis: **administrador** e **usuário comum**.
- Upload de arquivos (logo da equipe e foto do atleta).
- Rotas de consulta públicas; criar, editar e excluir apenas para administradores.

**Fora do escopo desta versão** (previsto para o futuro)

- Fases, grupos e chaveamento de mata-mata automáticos.
- Classificação gerada automaticamente.
- Categorias, contas de jogos eletrônicos, regulamentos e controle de inscrições.
- Histórico de ações administrativas.

## Estrutura do projeto

```
agon-hub/
├── README.md
├── database/
│   ├── schema.sql     # cria as tabelas
│   └── seed.sql       # preenche todas as tabelas com dados de exemplo
├── backend/           # API REST em Node.js + Express   (em desenvolvimento)
├── frontend/          # aplicação React                 (em desenvolvimento)
└── docs/              # documentação das rotas da API   (em desenvolvimento)
```

## Banco de dados

### Tabelas

| Tabela | Descrição | Relação |
|---|---|---|
| `usuarios` | Contas de login, com papel `admin` ou `usuario` | |
| `modalidades` | Esportes (`esporte`) e jogos eletrônicos (`esport`) | |
| `equipes` | Equipes reais ou fictícias, com logo | N:1 com `modalidades` |
| `atletas` | Pessoas atletas, com foto; conta de usuário é opcional | N:1 opcional com `usuarios` |
| `equipe_atletas` | Atletas de cada equipe | **N:N** `equipes` ↔ `atletas` |
| `campeonatos` | Edições de campeonatos | N:1 com `modalidades` |
| `campeonato_equipes` | Equipes participantes de cada campeonato | **N:N** `campeonatos` ↔ `equipes` |
| `partidas` | Partidas e placares | N:1 com `campeonatos` |
| `noticias` | Notícias e conteúdos editoriais | N:1 com `usuarios` |

### Como criar e preencher o banco

**Pré-requisito:** PostgreSQL instalado, com o comando `psql` disponível no terminal.

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/Souzaxs-Pjl/agon-hub.git
   cd agon-hub
   ```

2. Crie o banco de dados (será pedida a senha do usuário `postgres`):

   ```bash
   psql -U postgres -c "CREATE DATABASE agon_hub;"
   ```

3. Crie as tabelas:

   ```bash
   psql -U postgres -d agon_hub -f database/schema.sql
   ```

4. Preencha o banco com os dados de exemplo:

   ```bash
   psql -U postgres -d agon_hub -f database/seed.sql
   ```

Para **zerar o banco** e começar de novo, basta repetir os passos 3 e 4 (o `schema.sql` apaga e recria as tabelas).

> Prefere interface gráfica? No **pgAdmin**, crie o banco `agon_hub`, abra a *Query Tool*, carregue o arquivo `schema.sql` e execute; depois faça o mesmo com o `seed.sql`.

**Problema com acentos no Windows?** Antes de rodar os comandos, execute `set PGCLIENTENCODING=UTF8` (Prompt de Comando) ou `$env:PGCLIENTENCODING="UTF8"` (PowerShell).

### Usuários de teste

O seed traz três contas **fictícias** de usuário comum:

| E-mail | Senha | Papel |
|---|---|---|
| `maria@agonhub.example` | `Senha@123` | Usuário comum |
| `joao@agonhub.example` | `Senha@123` | Usuário comum |
| `ana@agonhub.example` | `Senha@123` | Usuário comum |

Essas senhas existem **apenas para desenvolvimento**. No banco ficam guardados somente os hashes bcrypt.

O seed **não cria nenhum administrador**, para que não exista senha de admin escrita no repositório. A conta de administrador é criada com o seu próprio e-mail e senha, pelo comando `npm run criar-admin` (veja a seção Backend).

## Backend

API REST em Node.js + Express. A documentação de todas as rotas (método, caminho, acesso, parâmetros e exemplos de resposta) está em [`docs/API.md`](docs/API.md).

### Pré-requisitos

- **Node.js 18 ou mais novo** (confira com `node --version`).
- **PostgreSQL** com o banco `agon_hub` já criado e preenchido (seção *Banco de dados*, acima).

### Como executar

Todos os comandos abaixo são na pasta `backend`.

1. Entre na pasta e instale as dependências:

   ```bash
   cd backend
   npm install
   ```

2. Crie o arquivo de configuração `.env` a partir do exemplo:

   ```bash
   cp .env.example .env        # Windows (Prompt de Comando): copy .env.example .env
   ```

   Abra o `.env` e preencha:
   - `DB_PASSWORD`: a senha do seu usuário do PostgreSQL;
   - `JWT_SECRET`: um segredo longo e aleatório. Para gerar um:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `ADMIN_EMAIL` e `ADMIN_SENHA`: o e-mail e a senha (mínimo 8 caracteres) que você quer para o administrador.

   > O arquivo `.env` contém segredos e **não vai para o GitHub** (está no `.gitignore`).

3. Crie a conta de administrador (usa o `ADMIN_EMAIL` e a `ADMIN_SENHA` do `.env`):

   ```bash
   npm run criar-admin
   ```

4. Inicie o servidor:

   ```bash
   npm run dev
   ```

   Deve aparecer `Conectado ao PostgreSQL.` e `API do AGON Hub rodando em http://localhost:3000`.

5. Confira no navegador: <http://localhost:3000/api/saude> deve mostrar `{"status":"ok","banco":"ok"}`.

### Testes

Com o servidor rodando (passo 4), abra **outro terminal** na pasta `backend` e execute:

```bash
npm test
```

Os testes conferem cadastro, login, token JWT e a proteção das rotas de administrador. Os testes de administrador só rodam se o `ADMIN_EMAIL` e a `ADMIN_SENHA` estiverem no `.env` e o passo 3 tiver sido feito.

### Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `Não foi possível conectar ao PostgreSQL` | Confira se o PostgreSQL está ligado e se `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` e `DB_NAME` do `.env` estão certos. |
| `defina um JWT_SECRET forte` | Gere e cole um segredo no `.env` (comando do passo 2). |
| `npm install` falha ao instalar o `bcrypt` | Use uma versão LTS do Node.js (18, 20 ou 22) e tente de novo. |
| `EADDRINUSE` (porta em uso) | Outra aplicação usa a porta 3000. Mude `PORT` no `.env`. |

## Frontend

*Em desenvolvimento — as instruções de execução serão adicionadas aqui.*

## Integrantes

<!-- Preencha com o nome do(s) autor(es) do projeto -->
- (nome)
