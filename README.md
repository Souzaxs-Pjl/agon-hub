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

| E-mail | Senha | Papel |
|---|---|---|
| `admin@agonhub.example` | `Admin@123` | Administrador |
| `maria@agonhub.example` | `Senha@123` | Usuário comum |
| `joao@agonhub.example` | `Senha@123` | Usuário comum |
| `ana@agonhub.example` | `Senha@123` | Usuário comum |

Essas senhas existem **apenas para desenvolvimento**. No banco ficam guardados somente os hashes bcrypt.

## Backend

*Em desenvolvimento — as instruções de execução e a documentação das rotas serão adicionadas aqui e em `docs/API.md`.*

## Frontend

*Em desenvolvimento — as instruções de execução serão adicionadas aqui.*

## Integrantes

<!-- Preencha com os nomes dos membros do grupo -->
- Nome 1
- Nome 2
- Nome 3
