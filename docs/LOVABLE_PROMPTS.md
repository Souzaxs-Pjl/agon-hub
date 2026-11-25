# Prompts de implementação — Lovable | AGON Hub

## Regras comuns para todos os prompts

O repositório oficial é `Souzaxs-Pjl/agon-hub`. O projeto existente utiliza React 18, Vite 5, React Router 6 e CSS próprio no frontend; backend Node.js + Express 5; PostgreSQL; JWT; bcrypt. Não recrie o sistema do zero.

**Regras obrigatórias:**
- Preserve a API e o banco de dados existentes.
- Não substitua Express/PostgreSQL por Supabase, Firebase ou outro backend.
- Não migre o frontend para Next.js, TypeScript, Tailwind ou shadcn/ui sem autorização.
- Não altere nomes de campos, tabelas e endpoints sem justificar.
- Não remova autenticação nem as proteções administrativas.
- Não crie conteúdo oficial fictício.
- Identifique dados do seed como demonstrativos.
- Antes de alterar, liste os arquivos que pretende modificar e explique o impacto.
- Faça alterações pequenas e verificáveis; não reescreva arquivos não relacionados.
- Nunca declare build ou testes aprovados sem realmente executá-los.

## Prompt 1 — Auditoria de compatibilidade

Analise a estrutura atual do frontend do AGON Hub antes de alterar qualquer coisa. Identifique as páginas, componentes, rotas, CSS, contexto de autenticação e chamadas à API. Produza um relatório com: funcionalidades já existentes, problemas de UX/responsividade, componentes repetidos e melhorias de baixo risco. Não altere arquivos ainda. Respeite React + Vite + React Router e o CSS próprio.

## Prompt 2 — Refinamento visual sem mudar a lógica

Melhore a interface existente do AGON Hub com base no sistema visual aprovado:
- fundo `#111318`;
- superfícies profundas `#08090C`;
- texto claro `#F5F5F5`;
- destaque `#C7F464`;
- secundário `#777D87`;
- superfície/borda `#D9DCE1`.

A direção é um universo esportivo híbrido, moderno, claro e funcional. Ajuste hierarquia tipográfica, espaçamento, cartões, formulários, navbar e responsividade. Preserve todas as rotas, handlers, estados, nomes de campos e integração com a API. Não crie dados nem telas com ações falsas. Antes de editar, mostre a lista de arquivos afetados.

## Prompt 3 — Estados da interface e acessibilidade

Revise as telas existentes para garantir feedback consistente:
- carregamento;
- lista vazia;
- erro de comunicação;
- erro HTTP de validação;
- sessão expirada;
- acesso negado;
- confirmação de exclusão;
- sucesso após salvar.

Garanta labels, foco visível, contraste e navegação por teclado. Mensagem de falha de comunicação não deve afirmar que o backend está desligado, pois a causa pode ser outra. Preserve as chamadas e os endpoints atuais.

## Prompt 4 — Revisão do CRUD administrativo de atletas

Revise a interface administrativa de atletas já existente em `frontend/src/pages/AdminRecursos.jsx` e os endpoints descritos em `docs/API.md`. Os campos do domínio incluem nome, apelido, bio, foto_url e usuário associado opcional. O vínculo atleta-equipe deve utilizar a tabela `equipe_atletas`, incluindo a função do atleta. Permita criar, consultar, editar e excluir, além de adicionar/remover vínculos. Nome, apelido e função devem aparecer na consulta pública de detalhes da equipe. Não invente endpoints: leia a documentação real da API e adapte-se a ela.

## Prompt 5 — Revisão de campeonatos e inscrições

Revise as telas administrativas existentes de campeonatos e inscrições. Campos: nome, edição, modalidade, datas de início/fim, status e descrição. Permita gerenciar equipes inscritas usando `campeonato_equipes`. Valide datas e duplicidade de inscrição. Antes de chamar a API, confira os endpoints documentados no repositório; não suponha nomes de rotas.

## Prompt 6 — Revisão do CRUD de partidas

Revise a interface administrativa existente para consultar, criar, editar e excluir partidas. Campos: campeonato, equipe mandante, equipe visitante, data/hora, fase, placar e status. Exiba se o registro é demonstrativo. Impedir que a mesma equipe seja escolhida nos dois lados. Não permitir placar negativo; se a partida estiver finalizada, exigir placar completo. Use apenas endpoints existentes e documentados.

## Prompt 7 — Revisão do CRUD de notícias

Revise a área administrativa e a listagem pública de notícias já criadas, comparando-as com o contrato atual da API. Campos previstos: título, resumo, conteúdo, imagem e autor. Não invente endpoints nem apresente texto gerado como notícia factual.

## Prompt 8 — Revisão de uploads de imagens

Revise os campos de upload já conectados às rotas do backend. Aceitar formatos raster previstos pela API (JPEG, PNG e WebP, conforme contrato), exibir pré-visualização e estado de envio. Enviar arquivo usando `FormData`, sem definir manualmente o cabeçalho `Content-Type`, pois o navegador precisa incluir o boundary multipart. Exibir a URL retornada pela API no campo correspondente. Tratar falhas e tamanho máximo de arquivo. Não converter uploads em URLs externas automaticamente.

## Prompt 9 — Revisão final de integração

Compare todas as chamadas do frontend com `docs/API.md` e com os arquivos de rotas do backend. Identifique incompatibilidades de métodos, caminhos, nomes de campos e formatos de resposta. Execute o build se o ambiente permitir. Entregue um resumo com arquivos alterados, testes executados, falhas e limitações. Não faça commit ou merge sem revisão explícita.
