# AGON Hub

> A central esportiva e social do Universo AGON.

## Sobre o projeto

O **AGON Hub** é uma aplicação web desenvolvida para funcionar como a central esportiva, informativa e social do **Universo AGON**.

A plataforma possui uma proposta dupla: dentro do universo fictício, o AGON Hub existe como uma plataforma utilizada para acompanhar competições, equipes, instituições, atletas, resultados e notícias. Ao mesmo tempo, fora da narrativa, ele funciona como o portal oficial para acompanhar e explorar a saga e todo o seu conteúdo.

O projeto é inspirado na organização e experiência de plataformas reais de esporte universitário, utilizando como referência principal o **Mascote Universitário**, mas possui identidade, arquitetura, banco de dados, código e conteúdo próprios.

O sistema será construído como uma aplicação **Full Stack**, utilizando React no frontend, Node.js e Express no backend e PostgreSQL como banco de dados.

---

## Objetivo

O objetivo do AGON Hub é centralizar as informações esportivas e sociais do Universo AGON em uma única plataforma.

A aplicação deverá permitir que seus usuários acompanhem:

* campeonatos;
* modalidades esportivas;
* equipes;
* instituições;
* partidas;
* resultados;
* classificações;
* calendário;
* notícias;
* jornais;
* highlights;
* rankings;
* estatísticas;
* histórico das competições;
* conteúdos relacionados ao Universo AGON.

Além disso, o sistema terá recursos de autenticação e interação social, permitindo que usuários cadastrados acompanhem equipes e interajam com conteúdos da plataforma.

---

## Proposta

O AGON Hub não será apenas um catálogo de informações.

A proposta é criar uma plataforma que represente a atividade esportiva do Universo AGON como se fosse um sistema real.

Por meio dela, será possível responder perguntas como:

* Quais campeonatos estão acontecendo?
* Quais são os próximos jogos?
* Qual foi o resultado de determinada partida?
* Quem lidera determinada competição?
* Quais equipes participam de um campeonato?
* Qual é o histórico de uma equipe?
* Quais notícias foram publicadas?
* Quais eventos estão próximos?
* Quais são os principais destaques?
* Quais instituições participam do universo esportivo?

A estrutura será preparada para crescer conforme o Universo AGON evoluir.

---

# Funcionalidades

## Funcionalidades obrigatórias

O projeto atenderá aos requisitos definidos para a aplicação web:

### Backend

* API REST;
* Node.js;
* Express;
* PostgreSQL;
* autenticação utilizando JWT;
* usuários comuns;
* administradores;
* CRUDs;
* relacionamento 1:N;
* relacionamento N:N;
* upload de arquivos;
* respostas em JSON;
* banco de dados inicializado por SQL;
* dados iniciais para todas as tabelas.

### Frontend

* React;
* consumo da API REST;
* autenticação;
* navegação entre páginas;
* formulários;
* visualização e gerenciamento dos dados;
* interface responsiva;
* integração com o backend.

### Repositório

* GitHub;
* README.md;
* colaboradores cadastrados;
* arquivos SQL de criação e população do banco.

---

# Funcionalidades planejadas

Além dos requisitos obrigatórios, o AGON Hub será desenvolvido com recursos adicionais para torná-lo uma plataforma mais completa.

## Notícias

* últimas notícias;
* notícia em destaque;
* categorias;
* imagens;
* autores;
* publicação e edição;
* notícias relacionadas;
* destaques da rodada.

## Campeonatos

* cadastro de campeonatos;
* edições;
* modalidades;
* equipes participantes;
* partidas;
* resultados;
* classificações;
* chaveamentos;
* calendário;
* estatísticas;
* histórico.

## Jogos

Cada partida poderá armazenar informações como:

* campeonato;
* edição;
* modalidade;
* equipes;
* data;
* horário;
* local;
* status;
* placar.

Futuramente, o sistema poderá receber informações mais detalhadas, como eventos, estatísticas, súmulas e outros dados de cada partida.

## Equipes

Cada equipe poderá possuir:

* nome;
* logo;
* descrição;
* instituição relacionada;
* história;
* títulos;
* participações;
* resultados;
* próximos jogos;
* seguidores.

## Instituições

O sistema também poderá armazenar instituições e organizações esportivas reais, permitindo relacioná-las às equipes presentes na plataforma.

## Usuários

Os usuários poderão possuir:

* nome;
* foto de perfil;
* biografia;
* equipes seguidas;
* favoritos;
* interações.

## Recursos sociais

Estão planejados:

* seguir equipes;
* reações;
* comentários;
* favoritos;
* notificações;
* feed personalizado.

---

# Universo AGON

O AGON Hub também possuirá uma área dedicada ao próprio universo fictício.

Essa área poderá reunir:

* Seis Equipes;
* temporadas;
* história;
* cronologia;
* rivalidades;
* títulos;
* competições;
* personagens;
* acontecimentos importantes;
* estatísticas históricas.

As seis equipes centrais atualmente definidas são:

1. Turquia
2. Rússia
3. Holanda
4. França
5. Grota
6. Tropa dos Laranjas

---

# Instituições e equipes reais

A base inicial também contará com instituições e organizações esportivas reais.

Entre os registros planejados estão:

* IFSP São Paulo;
* Mackenzie;
* UMC;
* Uni Sant'Anna;
* CAASO;
* UFSCar;
* PUCCAMP;
* UNESP Rio Claro;
* UFABC;
* UNICAMP;
* USP;
* FGV;
* ESPM;
* Insper;
* ITA;
* FEI;
* UNIP;
* FECAP;
* Santa Casa;
* PUC-SP;
* UFU;
* UFG;
* entre outras.

A base poderá ser ampliada futuramente.

---

# Realidade e ficção

Um dos princípios do banco de dados é permitir que entidades reais e fictícias coexistam de maneira organizada.

Exemplo:

```text
UFSCar
Tipo: REAL
```

```text
Turquia
Tipo: FICTÍCIO
```

Dessa forma, o AGON Hub poderá utilizar instituições reais na construção de seu cenário sem confundir sua natureza com as entidades fictícias do Universo AGON.

---

# Arquitetura

A arquitetura inicial do projeto seguirá o modelo:

```text
┌──────────────────────┐
│      React           │
│     Frontend         │
└──────────┬───────────┘
           │
           │ HTTP / JSON
           ▼
┌──────────────────────┐
│ Node.js + Express    │
│      REST API        │
└──────────┬───────────┘
           │
           │ SQL
           ▼
┌──────────────────────┐
│     PostgreSQL       │
│      Database        │
└──────────────────────┘
```

---

# Tecnologias

## Frontend

* React
* JavaScript
* HTML
* CSS

## Backend

* Node.js
* Express

## Banco de dados

* PostgreSQL
* SQL

## Autenticação e segurança

* JWT
* bcrypt

## Upload

* Multer

## Configuração

* dotenv

## Comunicação

* REST
* JSON

---

# Estrutura inicial do projeto

```text
AGON-HUB/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── database/
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── uploads/
│   ├── package.json
│   ├── server.js
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── assets/
│   │
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── arquitetura.md
│   ├── banco.md
│   └── api.md
│
├── README.md
└── .gitignore
```

---

# Banco de dados

O PostgreSQL será responsável por armazenar as informações principais do sistema.

Entre as entidades planejadas estão:

```text
USERS
ROLES

INSTITUTIONS
TEAMS
SPORTS

CHAMPIONSHIPS
CHAMPIONSHIP_EDITIONS

CHAMPIONSHIP_TEAMS

MATCHES
MATCH_EVENTS

STANDINGS
CALENDAR_EVENTS

NEWS
NEWSPAPERS
HIGHLIGHTS
MEDIA

COMMENTS
REACTIONS
FOLLOWS
```

O modelo definitivo será desenvolvido antes da implementação do banco.

---

# Relacionamentos

O sistema possuirá diferentes tipos de relacionamentos.

## 1:N

Exemplo:

```text
CHAMPIONSHIP
      │
      ├── EDITION 2025
      ├── EDITION 2026
      └── EDITION 2027
```

Um campeonato poderá possuir várias edições.

## N:N

Exemplo:

```text
TEAM
  ↕
CHAMPIONSHIP_EDITION
```

Uma equipe poderá participar de várias edições de campeonatos, enquanto uma edição poderá possuir várias equipes.

Para representar essa relação, será utilizada uma tabela intermediária:

```text
CHAMPIONSHIP_TEAMS
```

---

# Autenticação

O AGON Hub possuirá autenticação por JWT.

Inicialmente existirão dois níveis principais de acesso:

### Usuário comum

Poderá utilizar os recursos disponíveis para usuários registrados.

### Administrador

Possuirá permissões adicionais para gerenciamento dos dados e conteúdos da plataforma.

As senhas serão armazenadas de forma segura utilizando hashing, e não em texto puro.

---

# Upload de arquivos

O sistema utilizará upload de arquivos para recursos como:

* fotos de perfil;
* logos de equipes;
* imagens de notícias;
* imagens de campeonatos;
* mídias de highlights.

A estrutura será preparada para expansão futura.

---

# API

A API será organizada por recursos.

Exemplos de grupos de endpoints:

```text
/api/auth
/api/users
/api/teams
/api/institutions
/api/sports
/api/championships
/api/editions
/api/matches
/api/standings
/api/calendar
/api/news
/api/highlights
/api/comments
```

Os métodos HTTP utilizados incluirão:

```text
GET
POST
PUT
PATCH
DELETE
```

---

# Interface

A interface terá como referência a experiência de portais esportivos universitários, com foco em:

* navegação simples;
* informações esportivas em destaque;
* notícias;
* campeonatos;
* próximos jogos;
* resultados;
* calendário;
* classificações;
* páginas individuais;
* responsividade.

A identidade visual será própria do AGON Hub.

---

# Página inicial

A Home deverá concentrar as informações mais importantes da plataforma.

Estrutura inicial planejada:

```text
AGON HUB

Navegação

DESTAQUE PRINCIPAL

ÚLTIMAS NOTÍCIAS

CAMPEONATOS

PRÓXIMOS JOGOS

RESULTADOS RECENTES

HIGHLIGHTS

CALENDÁRIO

UNIVERSO AGON
```

---

# Página de campeonato

Cada edição de campeonato terá uma página própria.

Exemplo:

```text
AGON CUP 2026

[Visão geral]
[Jogos]
[Classificação]
[Chaveamento]
[Equipes]
[Calendário]
[Estatísticas]
```

---

# Painel administrativo

A aplicação contará com uma área administrativa para gerenciamento dos dados.

Exemplo:

```text
Dashboard

Usuários
Equipes
Instituições
Modalidades
Campeonatos
Edições
Jogos
Classificações
Calendário
Notícias
Jornais
Highlights
Arquivos
```

---

# Segurança

O sistema deverá considerar práticas básicas de segurança, incluindo:

* autenticação;
* autorização;
* hashing de senhas;
* validação de dados;
* tratamento de erros;
* proteção de rotas;
* controle de permissões;
* variáveis de ambiente;
* validação de uploads.

---

# Desenvolvimento

O projeto será desenvolvido de maneira incremental.

## Fase 0 — Fundação

* definição do conceito;
* definição das funcionalidades;
* arquitetura;
* entidades;
* relacionamentos;
* README.

## Fase 1 — Banco de dados

* modelagem;
* PostgreSQL;
* criação das tabelas;
* relacionamentos;
* constraints;
* dados iniciais.

## Fase 2 — Backend

* Node.js;
* Express;
* API REST;
* CRUDs;
* autenticação;
* autorização;
* upload.

## Fase 3 — Frontend

* React;
* componentes;
* páginas;
* layouts;
* autenticação;
* consumo da API.

## Fase 4 — Integração

* integração frontend/backend;
* validações;
* tratamento de erros;
* testes.

## Fase 5 — Recursos sociais

* seguir;
* reações;
* comentários;
* favoritos;
* perfis;
* notificações.

## Fase 6 — Universo AGON

* temporadas;
* rivalidades;
* títulos;
* personagens;
* cronologia;
* histórico;
* estatísticas avançadas.

---

# Estado atual

### Fundação

* [x] Nome definido
* [x] Conceito definido
* [x] Proposta definida
* [x] Referência de experiência definida
* [x] Stack inicial definida
* [x] Requisitos obrigatórios definidos
* [x] Funcionalidades planejadas
* [x] Equipes principais definidas
* [x] Uso de instituições reais definido
* [x] Separação entre entidades reais e fictícias definida

### Em desenvolvimento

* [ ] Modelo definitivo do banco
* [ ] Diagrama ER
* [ ] `schema.sql`
* [ ] `seed.sql`
* [ ] API REST
* [ ] Sistema de autenticação
* [ ] Upload
* [ ] Frontend React
* [ ] Interface
* [ ] Integração
* [ ] Testes

---

# Objetivos futuros

O AGON Hub foi projetado para continuar existindo depois da primeira entrega acadêmica.

A longo prazo, a plataforma poderá se tornar uma espécie de banco de dados vivo do Universo AGON, reunindo informações históricas, esportivas, narrativas e sociais em um único sistema.

A ideia é que novas temporadas, campeonatos, equipes, personagens, notícias e acontecimentos possam ser incorporados sem a necessidade de reconstruir a plataforma do zero.

---

# Projeto acadêmico

Este projeto está sendo desenvolvido como uma aplicação web Full Stack para uma atividade acadêmica que exige:

* backend REST em Node.js + Express;
* banco PostgreSQL;
* frontend em React;
* autenticação JWT;
* usuários comuns e administradores;
* relacionamentos 1:N e N:N;
* upload de arquivos;
* CRUDs;
* banco inicializado e populado por SQL;
* documentação em GitHub.

O AGON Hub foi planejado para atender a esses requisitos e, simultaneamente, servir como base para a expansão futura do Universo AGON.

---

# Licença

Projeto em desenvolvimento.

Todos os direitos sobre o conteúdo original relacionado ao **Universo AGON** pertencem aos seus respectivos criadores/autores.

O código-fonte e a licença definitiva do projeto serão definidos posteriormente.
