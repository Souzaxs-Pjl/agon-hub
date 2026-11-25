# Relatório acadêmico — AGON Hub

> **Documento-base para revisão e complementação antes da entrega.** Substitua os campos entre colchetes por informações confirmadas pela instituição e pelo estudante. Não declare testes aprovados sem evidências de execução.

## Capa

**AGON Hub — Plataforma integrada de informações esportivas e e-sports**

Estudante: [nome completo]  
Curso: Técnico em Informática para Internet  
Instituição: [nome da instituição]  
Disciplina: [disciplina]  
Professor(a): [nome]  
Cidade: [cidade]  
Ano: 2026

## Resumo

O AGON Hub é uma aplicação web acadêmica concebida para reunir informações relacionadas a equipes, atletas, modalidades, campeonatos, partidas e conteúdos editoriais de esportes tradicionais e e-sports. O sistema utiliza uma arquitetura cliente-servidor, com interface desenvolvida em React, API REST construída com Node.js e Express e persistência em banco de dados PostgreSQL.

A aplicação prevê dois níveis de acesso: usuário comum e administrador. O mecanismo de autenticação utiliza JSON Web Token (JWT), enquanto as senhas são armazenadas por meio de hash com bcrypt. A modelagem relacional contempla relacionamentos um-para-muitos e muitos-para-muitos, incluindo tabelas associativas para equipes e atletas e para campeonatos e equipes.

A versão atual já possui autenticação, operações CRUD de modalidades e equipes, consulta pública de equipes e painel administrativo de equipes. Os CRUDs de atletas, campeonatos, partidas e notícias, os vínculos administrativos e o upload de imagens constituem etapas de implementação e validação deste ciclo de desenvolvimento. Os dados do seed são demonstrativos e não devem ser interpretados como resultados ou cadastros oficiais.

**Palavras-chave:** aplicação web; API REST; React; Node.js; PostgreSQL; autenticação; gestão esportiva.

## 1. Introdução

A organização de informações esportivas pode envolver diferentes entidades, como equipes, atletas, modalidades e competições. Quando esses dados ficam distribuídos, sua consulta e administração tornam-se menos centralizadas. O AGON Hub foi proposto como uma plataforma digital para organizar essas informações em um único sistema, abrangendo modalidades esportivas tradicionais e jogos eletrônicos.

O projeto foi desenvolvido no contexto de uma atividade acadêmica individual, com atenção à integração entre interface, API e banco de dados, à aplicação de conceitos de programação web e à documentação das decisões técnicas.

## 2. Problema e justificativa

O problema abordado é a necessidade de organizar e consultar informações de equipes e competições em uma plataforma integrada. A proposta justifica-se pela oportunidade de aplicar, em um cenário concreto, conhecimentos de desenvolvimento frontend, backend, modelagem relacional, autenticação, autorização e testes de software.

## 3. Objetivos

### 3.1. Objetivo geral

Desenvolver uma aplicação web integrada para consulta e administração de informações esportivas e de e-sports.

### 3.2. Objetivos específicos

- Construir interface web com navegação entre páginas.
- Desenvolver API REST para comunicação com o frontend.
- Persistir dados em PostgreSQL.
- Implementar autenticação e controle de acesso por perfil.
- Modelar relações 1:N e N:N.
- Disponibilizar operações de cadastro, consulta, atualização e exclusão para os módulos definidos no MVP.
- Documentar a instalação, as rotas, os testes e as limitações conhecidas.

## 4. Escopo

O domínio do sistema inclui usuários, modalidades, equipes, atletas, campeonatos, partidas e notícias. O banco inicial contém nove tabelas, incluindo duas tabelas associativas.

O escopo funcional deve ser descrito conforme o status real de cada módulo na data da entrega:

- Implementado no repositório: autenticação, autorização administrativa, CRUD de modalidades e equipes, listagem e detalhe de equipes.
- Em implementação: CRUD de atletas, campeonatos, partidas e notícias; gerenciamento das relações N:N; upload de arquivos e interfaces correspondentes.
- Fora do escopo desta entrega, salvo decisão posterior: automação avançada de classificação, geração automática de chaveamento, integração com fontes externas em tempo real e funcionalidades sociais complexas.

## 5. Tecnologias e ferramentas

| Tecnologia | Aplicação no projeto |
|---|---|
| React | Interface e componentes |
| Vite | Servidor de desenvolvimento e build |
| React Router | Navegação |
| CSS | Estilização da interface |
| Node.js | Ambiente de execução do backend |
| Express | Rotas e middlewares da API REST |
| PostgreSQL | Banco de dados relacional |
| pg | Comunicação com o PostgreSQL |
| bcrypt | Hash de senhas |
| jsonwebtoken | Tokens JWT |
| dotenv | Configurações por ambiente |
| Git/GitHub | Versionamento e colaboração com o repositório |

## 6. Arquitetura

A aplicação é organizada em três camadas principais:

1. **Frontend:** apresenta páginas e formulários, recebe a interação do usuário e envia requisições HTTP à API.
2. **Backend:** recebe as requisições, valida dados, verifica autenticação e autorização e executa operações SQL.
3. **Banco de dados:** armazena usuários, modalidades, equipes, atletas, campeonatos, partidas e notícias, mantendo integridade referencial.

No desenvolvimento local, o Vite encaminha as chamadas iniciadas por `/api` para o servidor Express. O backend utiliza a biblioteca `pg` com consultas parametrizadas para acessar o PostgreSQL.

## 7. Modelagem de dados

As nove tabelas iniciais são:

- `usuarios`: contas de acesso, com papel e hash de senha.
- `modalidades`: esportes e jogos eletrônicos.
- `equipes`: equipes vinculadas a uma modalidade principal.
- `atletas`: dados de pessoas atletas; o vínculo com conta de usuário é opcional.
- `equipe_atletas`: associação entre equipe e atleta, incluindo função.
- `campeonatos`: edições de competições.
- `campeonato_equipes`: associação entre competição e equipe inscrita.
- `partidas`: confrontos, datas, fases, placares e status.
- `noticias`: conteúdos editoriais associados a um autor quando disponível.

As tabelas associativas materializam os relacionamentos N:N. Chaves estrangeiras, chaves primárias compostas, restrições de unicidade e restrições de domínio ajudam a preservar a integridade dos dados.

## 8. Autenticação e segurança

O cadastro público cria sempre uma conta de usuário comum. O login compara a senha enviada com o hash salvo no banco e retorna um token JWT. Rotas administrativas usam middleware de autenticação e autorização: primeiro é validada a assinatura e a validade do token; depois o backend consulta o usuário e seu papel atual no banco.

O frontend mantém o token no armazenamento local do navegador e consulta `/api/auth/me` para recuperar a sessão. O logout remove o token localmente; não há endpoint de logout no servidor nesta versão.

As consultas SQL devem utilizar parâmetros, e os dados enviados pelo cliente devem ser validados no backend. Segredos de ambiente, como senha do banco e chave JWT, ficam no arquivo `.env`, que não deve ser enviado ao repositório.

## 9. Funcionalidades e implementação

### 9.1. Implementadas no repositório

A versão atual contém:
- Cadastro, login e consulta de sessão com JWT.
- Autorização administrativa no backend.
- CRUD de modalidades e equipes.
- CRUD de atletas e vínculo N:N com equipes, incluindo função.
- CRUD de campeonatos e inscrição de equipes.
- CRUD de partidas, com fase, placar, status e indicador de resultado demonstrativo.
- CRUD de notícias.
- Upload administrativo de logos de equipes e fotos de atletas.
- Páginas públicas de consulta e painéis administrativos.

### 9.2. Validação automatizada concluída

O GitHub Actions executou a suíte backend na revisão atual da `main`, workflow #29: **77 testes aprovados, 0 falhas**. O build de produção do frontend também foi aprovado.

Referência: [workflow Validar AGON Hub — execução #29](https://github.com/Souzaxs-Pjl/agon-hub/actions/runs/45671746214).

### 9.3. Validação manual ainda necessária

- Conferir os fluxos completos no navegador, incluindo páginas públicas e administrativas.
- Verificar responsividade e acessibilidade básica.
- Confirmar envio, substituição e exibição de imagens no ambiente de apresentação.
- Inserir capturas de tela e preencher os dados pessoais/institucionais.
- Registrar limitações encontradas durante a demonstração.

## 10. Testes e validação

A automação do GitHub Actions utiliza PostgreSQL temporário e executa os testes backend e o build do frontend. Na execução #29, foram registrados **77 testes aprovados, 0 falhas**, e build de produção aprovado.

O resultado comprova a execução automatizada na revisão atual. A validação visual manual e as evidências da apresentação devem ser acrescentadas antes da entrega.

## 11. Resultados

[Preencher após a validação final.] Apresentar os módulos que foram demonstrados, os resultados dos testes, a integração com o banco e os objetivos efetivamente alcançados.

## 12. Limitações e trabalhos futuros

As limitações devem refletir a versão final. Entre possíveis evoluções estão importação de dados oficiais com fontes verificáveis, filtros e busca, classificações, automação de fases, notificações e auditoria de ações administrativas. Essas funcionalidades não devem ser descritas como existentes enquanto não forem implementadas.

## 13. Conclusão

[Reescrever após a entrega.] Retomar o objetivo geral, sintetizar o que foi desenvolvido, apontar os conhecimentos aplicados e registrar as limitações que permaneceram. A conclusão deve corresponder ao sistema realmente apresentado.

## Referências técnicas

- React — https://react.dev/
- Vite — https://vite.dev/
- React Router — https://reactrouter.com/
- Node.js — https://nodejs.org/
- Express — https://expressjs.com/
- PostgreSQL — https://www.postgresql.org/docs/
- node-postgres — https://node-postgres.com/
- JSON Web Tokens — https://www.jwt.io/introduction
- bcrypt — https://github.com/kelektiv/node.bcrypt.js
