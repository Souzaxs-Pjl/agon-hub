# AGON Hub

> **Mais que competição, um universo.**

O **AGON Hub** é uma aplicação web acadêmica que reúne informações de equipes, atletas, modalidades, campeonatos, partidas e conteúdos editoriais de esportes tradicionais e e-sports em um mesmo ambiente.

O projeto foi desenvolvido individualmente como parte do curso Técnico em Informática para Internet. Esta documentação descreve o que está implementado no repositório e separa essas funcionalidades das próximas etapas.

> **Versão demonstrativa (`main`):** mantém as 81 equipes cadastradas, utiliza **693 atletas fictícios distribuídos pelas 81 equipes**, e apresenta campeonatos, partidas e notícias de demonstração. Perfis fictícios e contas de demonstração começam públicos; cada usuário pode tornar seu perfil pessoal privado. Resultados e matérias não são oficiais.
>
> **Branches:** `main` é a versão acadêmica demonstrativa (frontend e backend). `deploy` preserva a versão canônica do universo AGON. Não faça merge entre elas. O Render e a Vercel da demonstração acompanham `main`.
>
> **Banco compartilhado:** o backend demonstrativo usa o PostgreSQL já configurado no Render. As migrações são idempotentes e não resetam a base; ainda assim, alterações de conta e publicações da comunidade persistem no banco compartilhado. Não execute `seed.sql` nem comandos destrutivos no banco de produção.

## 1. Situação atual do projeto

| Área | Situação no código |
|---|---|
| Banco PostgreSQL | 9 tabelas, relações 1:N e N:N e seed demonstrativo |
| API e conexão com o banco | Implementadas |
| Cadastro, login, JWT e recuperação de sessão | Implementados |
| Perfis pessoais com edição, foto, privacidade e compartilhamento | Implementados na `main`; atualização da API implantada ainda pendente |
| Permissões de administrador no backend | Implementadas |
| CRUD de modalidades | API e tela administrativa implementadas |
| CRUD de equipes | API e painel administrativo implementados |
| CRUD de atletas | API e tela administrativa implementadas |
| Vínculo atleta-equipe com função | API e controles de vínculo implementados |
| CRUD de campeonatos | API e tela administrativa implementadas |
| Inscrição de equipes em campeonatos | API e controles de inscrição implementados |
| CRUD de partidas | API e tela administrativa implementadas |
| CRUD de notícias | API e tela administrativa implementadas |
| Upload de logos e fotos | API validada por assinatura do arquivo; teste manual de upload ainda necessário |
| Consultas públicas | Equipes, 693 atletas fictícios, campeonatos, partidas e notícias demonstrativas |
| Testes automatizados | 77 testes existentes; CI será reexecutado após as alterações desta entrega |

A suíte automatizada foi aprovada no GitHub Actions #29 (77 testes, 0 falhas). A conferência visual manual e a demonstração no navegador ainda precisam ser registradas.


## 2. Objetivo

Construir uma plataforma web integrada que permita consultar informações esportivas e administrar os cadastros principais do universo AGON. O desenvolvimento prioriza uma implementação simples, modular e explicável, adequada ao escopo de um projeto acadêmico individual.

### Objetivos específicos

- Integrar frontend, backend e banco de dados relacional.
- Implementar cadastro e login com autenticação JWT.
- Diferenciar usuários comuns e administradores.
- Permitir que qualquer usuário cadastrado tenha um perfil pessoal, separado do cadastro esportivo de atleta.
- Permitir edição do perfil, controle de visibilidade e compartilhamento por link público.
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
│   │   │   ├── auth.js
│   │   │   ├── usuarios.js
│   │   │   ├── modalidades.js
│   │   │   ├── equipes.js
│   │   │   ├── atletas.js
│   │   │   ├── campeonatos.js
│   │   │   ├── partidas.js
│   │   │   ├── noticias.js
│   │   │   └── uploads.js
│   │   ├── db.js
│   │   ├── server.js
│   │   └── validacao.js
│   ├── tests/
│   ├── uploads/
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
    └── API.md
└── .github/
    └── workflows/
        └── ci.yml
```

O backend contém rotas para autenticação, usuários, modalidades, equipes, atletas, campeonatos, partidas, notícias e uploads. O frontend possui páginas públicas, autenticação, painel administrativo de equipes e um painel reutilizável para os demais módulos.


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

> **Segurança do banco:** o `schema.sql` usa `CREATE TABLE IF NOT EXISTS`, não apaga dados e acrescenta de forma idempotente os campos de perfil ausentes na tabela `usuarios`. O `seed.sql` insere dados demonstrativos e deve ser executado uma única vez em cada banco novo.

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
- Senhas armazenadas com hash bcrypt.
- Emissão e validação de token JWT.
- Recuperação da sessão por `GET /api/auth/me`.
- Autorização administrativa no backend.
- O cadastro público não permite escolher o papel de administrador.
- O logout remove o token do armazenamento local do navegador e limpa o estado do React. Não existe endpoint de logout no backend nesta versão.

### Modalidades e equipes

- CRUD completo de modalidades na API e no painel administrativo.
- CRUD completo de equipes na API e no painel administrativo.
- Cada equipe possui uma modalidade principal obrigatória.
- Consulta pública de equipes e detalhe com nome, apelido e função dos atletas vinculados.

### Atletas e relacionamentos

- CRUD de atletas na API e no painel administrativo.
- Associação opcional entre atleta e conta de usuário.
- Vínculo N:N entre atletas e equipes, com função registrada por equipe.
- A consulta pública de detalhe da equipe exibe nome, apelido e função.

### Campeonatos, inscrições e partidas

- CRUD de campeonatos na API e no painel.
- Inscrição e remoção de equipes por meio de `campeonato_equipes`.
- O backend impede inscrições entre modalidades diferentes.
- CRUD de partidas na API e no painel.
- As equipes de uma partida precisam estar inscritas no campeonato e pertencer à modalidade correspondente.
- Validação de equipes diferentes, placares não negativos e placar completo para partida finalizada.
- Partidas podem ser marcadas como demonstrativas.

### Notícias e imagens

- CRUD de notícias na API e no painel administrativo.
- Consultas públicas para atletas, campeonatos, partidas e notícias.
- Upload de logos de equipes e fotos de atletas por administradores.
- O upload aceita JPEG, PNG e WebP, até 5 MB, e grava o arquivo em `backend/uploads`.
- Os campos de imagem também podem receber uma URL HTTP/HTTPS.

### Interface

- Página inicial com atalhos para as áreas públicas.
- Navegação entre equipes, atletas, campeonatos, partidas e notícias.
- Formulários e listagens administrativas.
- Estados de carregamento, erro e confirmação em fluxos principais.
- Estilos próprios com adaptação para telas menores.

## 8. Auditoria dos requisitos de entrega

| Requisito | Situação atual |
|---|---|
| Quebra de layout e responsividade | CSS adaptativo existente; precisa de conferência visual final em celular e desktop |
| Área de toque, legibilidade, hierarquia, contraste, espaçamento e respiro | Estilos existentes; revisão manual de usabilidade pendente |
| Menus, navbar e fluxo intuitivo | Navbar inclui Equipes, Atletas, Campeonatos, Partidas, Notícias e Comunidade; testar navegação real |
| Feedback visual, estados de carregamento e erros | Implementados em páginas e chamadas principais; revisar durante QA |
| Links e botões | Rotas principais implementadas; teste manual de todos os links pendente |
| Formulários e prevenção de duplo envio | Validação frontend/backend existente; revisão por fluxo pendente |
| Controle de acesso e proteção de API | JWT e autorização de administrador no backend; operações comunitárias exigem autenticação e o backend valida autoria |
| Exposição de chaves | Segredos ficam em variáveis de ambiente; nunca colocar `.env` ou chaves no frontend |
| Injeção e sanitização | Consultas SQL parametrizadas e validações de entrada; revisão de segurança complementar pendente |
| Tratamento global de erros | Middleware global de erros implementado |
| Integridade e transações | Migrações 002/003 executadas em transação; constraints e chaves estrangeiras no schema |
| Performance e connection pooling | Pool `pg` configurado; otimização e análise de consultas pendentes |
| Índices em chaves estrangeiras | Conferir cobertura no schema antes de considerar concluído |
| CORS | Lista de origens permitidas configurada por `FRONTEND_URL` e `FRONTEND_URLS` |
| Logs, alertas e backups | Logs de servidor disponíveis; alertas e rotina de backup devem ser confirmados no painel do provedor |
| Sessão e condições de corrida | JWT com expiração; curtidas usam restrição única e `ON CONFLICT`; logout remove token local |
| Atualização de placares e consistência matemática | CRUD e validação de placares implementados; classificação e desempates automáticos completos não estão implementados |
| Upload e otimização de imagens | JPEG/PNG/WebP, limite de 5 MB e assinatura binária validados; otimização automática não implementada |
| Open Graph | Metadados sociais dinâmicos não implementados |
| Code splitting e cache de leitura | Não implementados como otimização dedicada |
| Paginação | Listagens públicas paginadas em 20 registros por página; feed comunitário limitado às 50 publicações mais recentes |
| Proporção de imagens e estabilidade visual | Classes de imagem existentes; conferência visual final necessária |

### Conteúdo da demonstração

- 81 equipes preservadas.
- 693 atletas fictícios com perfis públicos e vínculos distribuídos pelas 81 equipes.
- Campeonatos demonstrativos, equipes inscritas e partidas geradas pela migração `003_conteudo_demo_2026`.
- 15 notícias fictícias sobre campeonatos, equipes e atletas.
- Comunidade com publicação, curtida, comentário e exclusão pelo autor (ou administrador).
- Aba Comunidade disponível na navbar.
- Upload de foto de perfil disponível para usuário autenticado; logos e fotos esportivas são restritos a administrador.

### Cuidados de implantação

- A migração `003` é idempotente e não apaga tabelas ou dados existentes.
- O conteúdo esportivo da demonstração está marcado como demonstrativo no banco.
- O armazenamento atual de uploads é local em `backend/uploads`. Em instância com disco efêmero, arquivos podem desaparecer após reinício ou novo deploy; para persistência, configurar disco persistente ou armazenamento externo.
- O teste real de upload, a conferência visual e o smoke test das rotas precisam ser feitos no site publicado. Não são considerados concluídos apenas por compilar.

## 9. Pendências para conclusão da entrega

- Confirmar que o deploy do Render usando a branch `main` concluiu a migração 003 sem erro.
- Conferir se as 81 equipes exibem atletas e se os perfis fictícios abrem.
- Conferir campeonatos, partidas e notícias na interface pública.
- Testar login, edição de perfil, publicação, curtida, comentário e exclusão da própria publicação.
- Testar upload de foto de perfil e confirmar que a imagem aparece após salvar.
- Fazer uma passada visual em celular e desktop e corrigir apenas problemas bloqueadores.

## 10. Testes

Os testes automatizados usam o módulo nativo `node:test` do Node.js. O GitHub Actions prepara PostgreSQL temporário, instala as dependências, executa a suíte backend e gera o build de produção do frontend.

**Resultado confirmado na revisão atual da `main`:** workflow [Validar AGON Hub — execução #30](https://github.com/Souzaxs-Pjl/agon-hub/actions/runs/45672099610):

- Backend: 77 testes aprovados, 0 falhas.
- Frontend: build de produção aprovado.
- O CI utilizou PostgreSQL temporário; não foi necessário instalar banco no computador do estudante.
- O CI não substitui a conferência visual manual das telas no navegador.

Para executar localmente, dentro de `backend`:

```bash
npm test
```

Para compilar o frontend, dentro de `frontend`:

```bash
npm run build
```

Em ambiente local, os testes de integração precisam de PostgreSQL configurado e API ativa. O workflow do GitHub já prepara um banco temporário. Consulte os testes automatizados em `backend/tests/`. A validação visual manual deve ser feita no navegador, conforme o roteiro de conferência da entrega.

## 11. Segurança e cuidados

- Não publique o arquivo `.env`.
- Não use senhas reais nos dados de demonstração.
- Não armazene senhas em texto puro.
- Mantenha consultas SQL parametrizadas.
- Proteja operações administrativas no backend; ocultar botões no frontend não substitui autorização.
- Valide os dados recebidos pela API, mesmo que o frontend também faça validação.
- Faça backup antes de scripts destrutivos no banco.
- Identifique dados fictícios para não confundi-los com informações oficiais.

## 12. Documentação complementar

- [Documentação da API](docs/API.md)

## 13. Autor

Projeto acadêmico individual.

**Estudante:** [preencher nome completo]  
**Curso:** Técnico em Informática para Internet  
**Instituição:** [preencher instituição]  
**Ano:** 2026
