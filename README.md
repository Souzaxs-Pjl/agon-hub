# AGON Hub

> **Mais que competição, um universo.**

O **AGON Hub** é uma aplicação web acadêmica que reúne informações de equipes, atletas, modalidades, campeonatos, partidas e conteúdos editoriais de esportes tradicionais e e-sports em um mesmo ambiente.

O projeto foi desenvolvido individualmente como parte do curso Técnico em Informática para Internet. Esta documentação descreve o que está implementado no repositório e separa essas funcionalidades das próximas etapas.

> **Atenção — dados demonstrativos:** os registros inseridos por `database/seed.sql` são fictícios e servem para desenvolvimento e demonstração. As partidas do seed usam `demonstrativo = TRUE`. Eles não representam resultados oficiais.

## 1. Situação atual do projeto

| Área | Situação no código |
|---|---|
| Banco PostgreSQL | Estrutura inicial com 9 tabelas e dados demonstrativos |
| API e conexão com o banco | Implementadas |
| Cadastro, login e autenticação JWT | Implementados |
| Permissões de administrador | Implementadas no backend |
| CRUD de modalidades | Implementado |
| CRUD de equipes | Implementado |
| Consulta pública de equipes e detalhes | Implementada |
| Painel administrativo de equipes | Implementado |
| CRUD de atletas (API) | Implementado; interface administrativa pendente |
| Vínculo de atletas com equipes (API) | Implementado; interface administrativa pendente |
| CRUD de campeonatos (API) | Implementado; interface administrativa pendente |
| Inscrição de equipes em campeonatos (API) | Implementada; interface administrativa pendente |
| CRUD de partidas (API) | Implementado; interface administrativa pendente |
| CRUD de notícias (API) | Implementado; interface administrativa pendente |
| Upload de logos e fotos (API) | Implementado; interface de envio no frontend pendente |
| Testes ponta a ponta | Ainda precisam ser executados no ambiente com PostgreSQL |

Esta tabela é a referência para não apresentar como concluído algo que ainda está em desenvolvimento.

## 2. Objetivo

Construir uma plataforma web integrada que permita consultar informações esportivas e administrar os cadastros principais do universo AGON. O desenvolvimento prioriza uma implementação simples, modular e explicável, adequada ao escopo de um projeto acadêmico individual.

### Objetivos específicos

- Integrar frontend, backend e banco de dados relacional.
- Implementar cadastro e login com autenticação JWT.
- Diferenciar usuários comuns e administradores.
- Disponibilizar operações de consulta para visitantes.
- Restringir operações administrativas a usuários autorizados.
- Modelar relações 1:N e N:N no PostgreSQL.
- Organizar a API REST e documentar seus endpoints.
- Validar os fluxos principais com testes e demonstração prática.

## 3. Tecnologias utilizadas

| Camada | Tecnologia | Uso |
|---|---|---|
| Frontend | React 18 | Construção da interface |
| Ferramenta de desenvolvimento frontend | Vite 5 | Servidor local e build |
| Navegação | React Router 6 | Rotas entre páginas |
| Estilização | CSS próprio | Layout e componentes visuais |
| Backend | Node.js + Express 5 | API REST |
| Banco de dados | PostgreSQL | Persistência relacional |
| Acesso ao banco | node-postgres (`pg`) | Consultas SQL parametrizadas |
| Autenticação | JSON Web Token (`jsonwebtoken`) | Emissão e validação de tokens |
| Hash de senhas | bcrypt | Armazenamento seguro de senhas |
| Configuração | dotenv | Leitura de variáveis de ambiente |
| Versionamento | Git e GitHub | Histórico e armazenamento do código |

**Observação:** a versão atual utiliza CSS próprio; Tailwind CSS não está instalado. Multer é utilizado pelo backend para receber arquivos de imagem.

## 4. Estrutura do repositório

```text
agon-hub/
├── README.md
├── database/
│   ├── schema.sql
│   └── seed.sql
├── backend/
│   ├── scripts/
│   │   └── criar-admin.js
│   ├── src/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── db.js
│   │   ├── server.js
│   │   └── validacao.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── docs/
    ├── API.md
    ├── APRESENTACAO.md
    ├── FIGMA_BRIEF.md
    ├── LOVABLE_PROMPTS.md
    ├── PLANO_DE_TESTES.md
    └── RELATORIO_ACADEMICO.md
```

A estrutura acima representa os principais arquivos e documentos do projeto. As rotas CRUD de atletas, campeonatos, partidas e notícias e o módulo de upload já existem no backend; as interfaces correspondentes ainda precisam ser concluídas.

## 5. Modelagem do banco de dados

A estrutura atual possui nove tabelas:

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Contas que podem entrar na plataforma |
| `modalidades` | Esportes e jogos eletrônicos |
| `equipes` | Equipes vinculadas a uma modalidade |
| `atletas` | Dados das pessoas atletas |
| `equipe_atletas` | Associação N:N entre equipes e atletas, incluindo a função |
| `campeonatos` | Edições de competições |
| `campeonato_equipes` | Associação N:N entre campeonatos e equipes |
| `partidas` | Jogos, datas, fases, placares e situação |
| `noticias` | Conteúdos editoriais |

### Relacionamentos

- Uma modalidade pode estar associada a várias equipes (1:N).
- Uma modalidade pode estar associada a vários campeonatos (1:N).
- Uma equipe pode ter vários atletas e um atleta pode participar de mais de uma equipe (N:N), por meio de `equipe_atletas`.
- Um campeonato pode ter várias equipes e uma equipe pode participar de vários campeonatos (N:N), por meio de `campeonato_equipes`.
- Um campeonato pode ter várias partidas (1:N).
- Uma conta de usuário pode estar associada a um cadastro de atleta; essa associação é opcional.
- Um usuário pode ser autor de várias notícias.

A equipe possui uma modalidade principal obrigatória em `modalidade_id`. Os vínculos e as relações são controlados por chaves primárias, chaves estrangeiras, restrições `UNIQUE` e regras `CHECK`.

## 6. Preparação do ambiente

### Pré-requisitos

- Node.js 18 ou superior.
- npm.
- PostgreSQL instalado e em execução.
- Git para clonar o repositório.

Confira as versões:

```bash
node --version
npm --version
psql --version
```

### 6.1. Clonar o repositório

```bash
git clone https://github.com/Souzaxs-Pjl/agon-hub.git
cd agon-hub
```

### 6.2. Criar o banco

Crie o banco vazio:

```bash
psql -U postgres -c "CREATE DATABASE agon_hub;"
```

Execute os scripts na ordem:

```bash
psql -U postgres -d agon_hub -f database/schema.sql
psql -U postgres -d agon_hub -f database/seed.sql
```

> **Segurança do banco:** o `schema.sql` usa `CREATE TABLE IF NOT EXISTS` e não apaga tabelas existentes. Ele cria tabelas ausentes, mas não altera automaticamente colunas ou restrições de tabelas já criadas; mudanças estruturais futuras devem ser feitas por migrações SQL específicas. O `seed.sql` insere dados demonstrativos e deve ser executado uma única vez em cada banco novo.

### 6.3. Configurar o backend

```bash
cd backend
npm install
cp .env.example .env
```

No Windows, a cópia pode ser feita com:

```powershell
Copy-Item .env.example .env
```

Edite `backend/.env` e configure os valores do PostgreSQL e do JWT:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres
DB_NAME=agon_hub
JWT_SECRET=coloque_um_segredo_aleatorio_com_ao_menos_32_caracteres
JWT_EXPIRES_IN=2h
ADMIN_NOME=Administrador AGON
ADMIN_EMAIL=seu_email
ADMIN_SENHA=sua_senha
```

Gere um segredo aleatório para o JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Crie a conta de administrador:

```bash
npm run criar-admin
```

Inicie a API:

```bash
npm run dev
```

A API deve ficar disponível em `http://localhost:3000`. Consulte `http://localhost:3000/api/saude` para verificar o servidor e a conexão com o banco.

### 6.4. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`. Durante o desenvolvimento, o Vite encaminha as requisições iniciadas por `/api` para o backend em `http://localhost:3000`.

## 7. Funcionalidades implementadas

### Acesso e segurança

- Cadastro público de conta comum.
- Login com e-mail e senha.
- Senha armazenada como hash bcrypt, não em texto puro.
- Emissão e validação de token JWT.
- Consulta do usuário autenticado em `GET /api/auth/me`.
- Autorização administrativa no backend.
- Cadastro público não permite escolher o papel de administrador.
- O logout atual remove o token do armazenamento local do navegador e limpa o usuário do estado do React. Não existe endpoint de logout no backend nesta versão.

### Modalidades

A API possui operações de consulta, criação, edição e exclusão. Os tipos aceitos no banco são `esporte` e `esport` (valor interno utilizado para jogos eletrônicos).

### Equipes

A API possui operações de consulta, criação, edição e exclusão. Cada equipe precisa estar vinculada a uma modalidade existente. O painel administrativo atual permite administrar equipes.

### Consulta pública

Visitantes podem consultar a lista de equipes e abrir o detalhe de cada equipe. A página de detalhe apresenta os atletas vinculados, com nome, apelido e função.

## 8. Funcionalidades planejadas para conclusão do MVP

As estruturas das tabelas já existem no banco, mas a presença de uma tabela não significa que a funcionalidade esteja pronta no sistema. As próximas entregas são:

- Interfaces administrativas e públicas para atletas, campeonatos, partidas e notícias.
- Gerenciamento visual dos vínculos entre atletas/equipes e inscrições em campeonatos.
- Interface para envio de logos e fotos usando os endpoints de upload já disponíveis.
- Execução dos testes de integração e revisão final.

## 9. Testes

Os testes automatizados usam o módulo nativo `node:test` do Node.js. Existem testes de autenticação, equipes e um conjunto de integração para atletas, campeonatos, partidas, notícias e uploads. Os testes de integração fazem requisições HTTP à API e precisam de PostgreSQL e servidor ativos. O GitHub Actions possui um workflow que prepara PostgreSQL temporário e executa os testes e o build.

Dentro da pasta `backend`:

```bash
npm test
```

Os testes administrativos precisam de uma conta criada com `npm run criar-admin`. Os testes de integração de equipes também criam e removem um registro temporário. Consulte `docs/PLANO_DE_TESTES.md` para o roteiro completo e para os casos planejados das novas funcionalidades.

## 10. Segurança e cuidados

- Não publique o arquivo `.env`.
- Não use senhas reais nos dados de demonstração.
- Não armazene senhas em texto puro.
- Mantenha consultas SQL parametrizadas.
- Proteja operações administrativas no backend; ocultar botões no frontend não substitui autorização.
- Valide os dados recebidos pela API, mesmo que o frontend também faça validação.
- Faça backup antes de scripts destrutivos no banco.
- Identifique dados fictícios para não confundi-los com informações oficiais.

## 11. Documentação complementar

- [Documentação da API](docs/API.md)
- [Plano de testes](docs/PLANO_DE_TESTES.md)
- [Relatório acadêmico — estrutura](docs/RELATORIO_ACADEMICO.md)
- [Roteiro de apresentação](docs/APRESENTACAO.md)
- [Briefing para Figma](docs/FIGMA_BRIEF.md)
- [Prompts para Lovable](docs/LOVABLE_PROMPTS.md)

## 12. Autor

Projeto acadêmico individual.

**Estudante:** [preencher nome completo]  
**Curso:** Técnico em Informática para Internet  
**Instituição:** [preencher instituição]  
**Ano:** 2026
