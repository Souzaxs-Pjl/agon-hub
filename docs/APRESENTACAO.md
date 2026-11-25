# Roteiro de apresentação — AGON Hub

Duração sugerida: 7 a 9 minutos. Ajuste ao tempo definido pelo professor.

## 1. Abertura — 40 segundos

"Bom dia. Meu projeto é o AGON Hub, uma plataforma web que reúne informações de esportes tradicionais e e-sports. A proposta é centralizar equipes, atletas, modalidades, campeonatos, partidas e conteúdos em um mesmo ambiente. O lema do projeto é: Mais que competição, um universo."

## 2. Problema e objetivo — 50 segundos

"Organizar dados esportivos envolve diferentes tipos de informação e relações entre elas. O AGON Hub busca oferecer uma aplicação integrada, com uma área pública de consulta e uma área administrativa para manter os cadastros. O foco foi construir uma base funcional, simples de explicar e com dados persistidos em banco relacional."

## 3. Tecnologias e arquitetura — 60 segundos

"Na interface usei React com Vite e React Router. O backend é uma API REST feita com Node.js e Express. Os dados são armazenados no PostgreSQL, acessado pelo pacote pg. A comunicação ocorre por requisições HTTP em JSON. O frontend não acessa o banco diretamente: ele conversa com a API, e o backend executa as consultas."

Mostrar o fluxo: **Navegador → React → API Express → PostgreSQL**.

## 4. Modelagem do banco — 60 segundos

"O banco possui tabelas para usuários, modalidades, equipes, atletas, campeonatos, partidas e notícias, além de tabelas associativas. Um exemplo de relação muitos-para-muitos é equipe e atleta: uma equipe tem várias pessoas, e uma pessoa pode ter vínculos com equipes. A tabela equipe_atletas guarda essa associação e a função do atleta. O mesmo conceito é usado em campeonato_equipes para as inscrições."

Mostrar o diagrama ou o schema SQL. Explicar uma relação 1:N e uma N:N.

## 5. Segurança — 60 segundos

"O cadastro público cria apenas usuários comuns. As senhas são armazenadas com hash bcrypt. No login, a API gera um token JWT. Nas rotas administrativas, o backend valida o token e consulta o papel atual do usuário. Assim, não basta esconder um botão na interface: a própria API bloqueia operações de quem não é administrador."

Demonstrar cadastro/login e, se possível, uma tentativa de acesso sem permissão.

## 6. Demonstração funcional — 2 a 3 minutos

Ordem sugerida:

1. Abrir a página inicial e apresentar os atalhos de navegação.
2. Abrir Equipes, escolher uma equipe e mostrar modalidade e atletas (nome, apelido e função).
3. Entrar com administrador e abrir o painel de equipes.
4. Criar uma equipe de demonstração, enviar um logo, editar e excluir a equipe de teste.
5. Abrir Administração > Modalidades e mostrar o CRUD.
6. Abrir Administração > Atletas, cadastrar um atleta e vinculá-lo a uma equipe com função.
7. Abrir Administração > Campeonatos, criar um campeonato e inscrever equipes da mesma modalidade.
8. Abrir Administração > Partidas e cadastrar um confronto entre equipes inscritas.
9. Abrir Administração > Notícias e criar um conteúdo demonstrativo.
10. Conferir as páginas públicas de atletas, campeonatos, partidas e notícias.
11. Sair e mostrar a restrição do painel para usuário sem permissão.

O workflow #29 foi aprovado (77 testes e build frontend). Antes da apresentação, confira manualmente no navegador os fluxos que pretende demonstrar. Se algum módulo falhar visualmente, apresente apenas os fluxos confirmados e explique a limitação.

## 7. Testes e limitações — 50 segundos

"A suíte automatizada foi executada no GitHub Actions com PostgreSQL temporário: 77 testes passaram e não houve falhas. O build do frontend também foi aprovado. Os dados do seed são demonstrativos. A conferência visual no navegador complementa os testes automatizados."

Apresentar o resultado confirmado do CI: 77 aprovados e 0 falhas na execução #29. Não afirmar que os testes manuais passaram sem tê-los executado.

## 8. Encerramento — 30 segundos

"O principal resultado é uma base integrada de aplicação web, com frontend, API, autenticação e persistência relacional, pronta para evoluir por módulos. O desenvolvimento também permitiu aplicar modelagem de dados, rotas REST, validação, autorização e integração entre tecnologias. Obrigado."

## Perguntas que você precisa saber responder

**Por que React?**  
Para construir uma interface baseada em componentes e organizar o estado visual da aplicação.

**Por que Express?**  
Para definir rotas HTTP, middlewares e respostas da API com uma estrutura simples em Node.js.

**Por que PostgreSQL?**  
Porque o domínio possui entidades relacionadas e exige integridade referencial, chaves estrangeiras e tabelas associativas.

**O que é CRUD?**  
Create, Read, Update e Delete: criar, consultar, atualizar e excluir registros.

**O que é uma API REST?**  
Uma interface de comunicação por recursos e métodos HTTP, como GET, POST, PUT e DELETE.

**Qual a diferença entre autenticação e autorização?**  
Autenticação identifica o usuário; autorização verifica se ele tem permissão para executar determinada ação.

**Para que serve o JWT?**  
É um token assinado que permite à API validar a identidade apresentada em requisições protegidas, dentro de sua validade.

**Por que bcrypt?**  
Para armazenar hashes de senhas, evitando guardar as senhas originais no banco.

**O que é N:N?**  
Uma relação em que várias linhas de uma entidade podem se associar a várias linhas de outra. No AGON Hub, equipe-atleta é um exemplo.

**O que acontece quando um usuário comum tenta criar uma equipe?**  
A API exige autenticação e papel administrativo. Um usuário autenticado sem essa permissão recebe HTTP 403.

**O que os dados demonstrativos significam?**  
São registros fictícios para testar e apresentar a aplicação. Não podem ser apresentados como resultados ou dados oficiais.

**O que ainda falta?**  
Responder com o status real da versão entregue, distinguindo módulos implementados, testados e planejados.
