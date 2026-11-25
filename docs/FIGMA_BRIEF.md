# Briefing de design — Figma | AGON Hub

## Objetivo

Criar um sistema visual e um protótipo navegável para o frontend do AGON Hub, respeitando o escopo funcional e a arquitetura existentes. O Figma será usado para planejar e validar a interface; não deve inventar funcionalidades nem substituir a API.

## Produto

AGON Hub é uma plataforma digital de esportes tradicionais e e-sports. Lema: **Mais que competição, um universo.**

Públicos: visitantes, atletas/players, usuários cadastrados e administradores.

## Direção visual aprovada

- Personalidade: universo esportivo híbrido, moderno e confiável.
- Intensidade: equilibrada; presença esportiva sem excesso de elementos.
- Estética: editorial + produto digital, com hierarquia clara, cartões funcionais e dados legíveis.
- Evitar: excesso de gradientes, glassmorphism em tudo, animações decorativas e aparência genérica de dashboard.

### Paleta institucional

| Token | Hex | Uso |
|---|---|---|
| Fundo principal | `#111318` | Fundo escuro |
| Texto principal claro | `#F5F5F5` | Texto sobre fundo escuro |
| Destaque AGON | `#C7F464` | Ações primárias e indicadores |
| Fundo profundo | `#08090C` | Navegação e áreas de contraste |
| Texto secundário | `#777D87` | Metadados e legendas |
| Superfície clara | `#D9DCE1` | Bordas/superfícies neutras |

Preservar contraste acessível. Não usar o verde-limão em grandes blocos de texto.

## Arquitetura de informação

### Navegação principal
- Início
- Equipes
- Entrar / Cadastrar
- Administração (apenas para administrador autenticado)

### Telas obrigatórias
1. **Início:** proposta de valor, chamada para consultar equipes e acesso à conta.
2. **Login:** e-mail, senha, mensagens de validação.
3. **Cadastro:** nome, e-mail e senha; não expor escolha de papel.
4. **Lista de equipes:** cartões com nome, sigla, modalidade, tipo e logo.
5. **Detalhe de equipe:** identidade, modalidade, instituição/descrição quando presentes e tabela/lista de atletas com nome, apelido e função.
6. **Administração de equipes:** formulário de criação/edição e tabela de registros.
7. **Administração de modalidades:** revisar o formulário e a listagem já existentes no painel reutilizável.
8. **Administração de atletas:** revisar CRUD, associação opcional de usuário, upload de foto e vínculos com equipes/funções.
9. **Administração de campeonatos:** revisar CRUD e inscrição/remoção de equipes.
10. **Administração de partidas:** revisar seleção de campeonato/equipes, data, fase, placar, status e indicador demonstrativo.
11. **Administração de notícias:** revisar CRUD de título, resumo, conteúdo e imagem.
12. **Consultas públicas:** revisar as páginas de atletas, campeonatos, partidas e notícias, alimentadas pela API.

## Componentes e estados

Criar componentes:
- Navbar e navegação responsiva.
- Botão primário, secundário e destrutivo.
- Campo de texto, senha, select, textarea e input de arquivo (este último somente para o fluxo de upload após implementação).
- Card de equipe.
- Tabela administrativa.
- Etiquetas de modalidade e tipo de equipe.
- Alertas de sucesso e erro.
- Estados: carregando, vazio, erro, sem permissão e sucesso.
- Diálogo de confirmação de exclusão.

## Responsividade

Entregar frames desktop (1440 px), tablet (768 px) e mobile (390 px). No mobile:
- menu acessível;
- cartões em uma coluna;
- tabelas com adaptação ou rolagem horizontal controlada;
- formulários em largura total;
- alvos de toque confortáveis.

## Acessibilidade

- Contraste adequado.
- Estados de foco visíveis.
- Labels associados aos campos.
- Não comunicar status apenas por cor.
- Hierarquia consistente de títulos.
- Componentes utilizáveis por teclado.

## Entregáveis no Figma

1. Página "Design System": cores, tipografia, espaçamentos, grid, bordas e componentes.
2. Página "Wireframes": estrutura das telas.
3. Página "UI": telas finais desktop e mobile.
4. Página "Prototype": fluxo de visitante, cadastro/login, consulta de equipe e administração.
5. Página "Handoff": notas sobre componentes, estados, dimensões e comportamento.

## Restrições importantes

- Não alterar nomes de rotas, campos ou regras de negócio por conta própria.
- Não inventar dados oficiais.
- Exibir claramente que o conteúdo do seed é demonstrativo.
- Nome, apelido e função dos atletas podem aparecer no detalhe público da equipe.
- A equipe possui uma modalidade principal obrigatória.
- Não redesenhar autenticação para permitir cadastro público como administrador.
- O código atual usa React + Vite + CSS próprio; desenhar componentes que possam ser implementados sem depender obrigatoriamente de Tailwind ou shadcn/ui.

## Critérios de aceite

- Interface coerente em desktop e mobile.
- Identidade visual consistente com a paleta aprovada.
- Fluxos principais compreensíveis sem instrução externa.
- Estados de carregamento, erro, vazio e acesso negado desenhados.
- Componentes reaproveitáveis e medidas anotadas para implementação.
