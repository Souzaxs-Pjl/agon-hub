-- =====================================================================
-- AGON Hub - seed.sql
-- Preenche TODAS as tabelas com dados de exemplo.
--
-- COMO USAR (depois de rodar o schema.sql):
--   psql -U postgres -d agon_hub -f database/seed.sql
--
-- ATENÇÃO: TODOS os dados deste arquivo são DEMONSTRATIVOS (fictícios).
-- Equipes, atletas, placares e notícias foram inventados só para testar
-- o sistema. As partidas estão marcadas com demonstrativo = TRUE.
-- Os campos de imagem (logo_url, foto_url, imagem_url) ficam NULL porque
-- as imagens reais entram depois, pelo upload do sistema.
--
-- USUÁRIOS DE TESTE (contas fictícias; as senhas valem só para desenvolvimento):
--   maria@agonhub.example   senha: Senha@123   (usuário comum)
--   joao@agonhub.example    senha: Senha@123   (usuário comum)
--   ana@agonhub.example     senha: Senha@123   (usuário comum)
-- No banco ficam guardados apenas os HASHES bcrypt das senhas.
--
-- ADMINISTRADOR: este arquivo NÃO cria nenhuma conta de administrador,
-- para que não exista senha de admin escrita no repositório. O admin é
-- criado depois, com o e-mail e a senha do seu arquivo .env:
--   cd backend && npm run criar-admin
--
-- O usuário 1 ("Redação AGON") é uma conta editorial usada apenas como
-- autora das notícias de exemplo. Ninguém consegue entrar nela: o valor
-- '!' no lugar do hash não é um hash bcrypt válido, então nenhuma senha
-- confere com ele.
-- =====================================================================

BEGIN;  -- tudo ou nada: se algum INSERT falhar, nada é gravado

-- ---------------------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha_hash, papel) VALUES
(1, 'Redação AGON',       'redacao@agonhub.example', '!', 'usuario'),
(2, 'Maria Souza',        'maria@agonhub.example','$2a$10$aBa8oKoweHxLHsDVi7nHdOko/MYnE2H50KyULe59BTHelRJ4QlIKS', 'usuario'),
(3, 'João Lima',          'joao@agonhub.example',  '$2a$10$qafIna878Jve/UhK.GKTPuTebgabpwQGFlrox/RFvi1YDD5KHhGwa', 'usuario'),
(4, 'Ana Costa',          'ana@agonhub.example',   '$2a$10$bXZoCTPIxDMiR8lHndbLTeYqbx4cCYg1ypI3pUg0X5R/yoqGvqWwe', 'usuario');

-- ---------------------------------------------------------------------
-- MODALIDADES (esportes tradicionais e jogos eletrônicos)
-- ---------------------------------------------------------------------
INSERT INTO modalidades (id, nome, tipo, descricao) VALUES
(1,  'Futebol',         'esporte', 'Esporte coletivo disputado em campo por duas equipes.'),
(2,  'Futsal',          'esporte', 'Futebol de salão, disputado em quadra por equipes de cinco jogadores.'),
(3,  'Vôlei',           'esporte', 'Esporte de quadra em que duas equipes se enfrentam separadas por uma rede.'),
(4,  'Basquete',        'esporte', 'Esporte coletivo em que o objetivo é converter cestas.'),
(5,  'Atletismo',       'esporte', 'Conjunto de provas de corrida, saltos, arremessos e lançamentos.'),
(6,  'Handebol',        'esporte', 'Esporte coletivo de quadra jogado com as mãos.'),
(7,  'Judô',            'esporte', 'Arte marcial e esporte de combate com origem japonesa.'),
(8,  'Xadrez',          'esporte', 'Jogo de estratégia disputado em tabuleiro por dois jogadores.'),
(9,  'Free Fire',       'esport',  'Jogo eletrônico de tiro e sobrevivência para dispositivos móveis.'),
(10, 'League of Legends','esport', 'Jogo eletrônico de estratégia em equipe no estilo MOBA.'),
(11, 'Valorant',        'esport',  'Jogo eletrônico de tiro tático em equipes de cinco jogadores.'),
(12, 'Mobile Legends',  'esport',  'Jogo eletrônico MOBA para dispositivos móveis.'),
(13, 'Honor of Kings',  'esport',  'Jogo eletrônico MOBA para dispositivos móveis.');

-- ---------------------------------------------------------------------
-- EQUIPES (fictícias, exceto a "Atlética Exemplo", que usa o tipo 'real'
-- apenas para demonstrar a distinção entre os dois tipos)
-- ---------------------------------------------------------------------
INSERT INTO equipes (id, nome, sigla, tipo, instituicao, descricao, logo_url, modalidade_id) VALUES
(1, 'Falcões do Norte',      'FDN', 'ficticia', NULL, 'Equipe fictícia de futsal criada para demonstração do AGON Hub.', NULL, 2),
(2, 'Tigres Azuis',          'TGA', 'ficticia', NULL, 'Equipe fictícia de futsal criada para demonstração do AGON Hub.', NULL, 2),
(3, 'Lobos de Aço',          'LDA', 'ficticia', NULL, 'Equipe fictícia de futsal criada para demonstração do AGON Hub.', NULL, 2),
(4, 'Atlética Exemplo',      'ATE', 'real',     'Instituição de Ensino Exemplo', 'Equipe demonstrativa usada para exemplificar o tipo "real".', NULL, 2),
(5, 'Nova Alvorada Esports', 'NAE', 'ficticia', NULL, 'Equipe fictícia de Valorant criada para demonstração do AGON Hub.', NULL, 11),
(6, 'Pulso Neon',            'PLN', 'ficticia', NULL, 'Equipe fictícia de Valorant criada para demonstração do AGON Hub.', NULL, 11),
(7, 'Cobra Carmesim',        'CCM', 'ficticia', NULL, 'Equipe fictícia de Valorant criada para demonstração do AGON Hub.', NULL, 11),
(8, 'Vórtice Digital',       'VDG', 'ficticia', NULL, 'Equipe fictícia de Valorant criada para demonstração do AGON Hub.', NULL, 11);

-- ---------------------------------------------------------------------
-- ATLETAS (fictícios). A Maria (atleta 1) tem conta de usuário (usuario_id = 2);
-- os demais não têm conta, mostrando que Pessoa e Usuário são coisas separadas.
-- ---------------------------------------------------------------------
INSERT INTO atletas (id, nome, apelido, bio, foto_url, usuario_id) VALUES
(1,  'Maria Souza',     'Mari',    'Atleta demonstrativa (dados fictícios). Joga como ala no futsal.', NULL, 2),
(2,  'Bruno Teles',     'Brunão',  'Atleta demonstrativo (dados fictícios). Atua no futsal e no Valorant.', NULL, NULL),
(3,  'Carla Mendes',    'Carlinha','Atleta demonstrativa (dados fictícios). Goleira de futsal.', NULL, NULL),
(4,  'Diego Rocha',     'Dedé',    'Atleta demonstrativo (dados fictícios). Pivô de futsal.', NULL, NULL),
(5,  'Eduardo Lima',    'Edu',     'Atleta demonstrativo (dados fictícios). Ala de futsal.', NULL, NULL),
(6,  'Fernanda Alves',  'Fê',      'Atleta demonstrativa (dados fictícios). Fixa de futsal.', NULL, NULL),
(7,  'Gabriel Nunes',   'Gabi',    'Atleta demonstrativo (dados fictícios). Goleiro de futsal.', NULL, NULL),
(8,  'Helena Prado',    'Lena',    'Atleta demonstrativa (dados fictícios). Pivô de futsal.', NULL, NULL),
(9,  'Igor Martins',    'Nox',     'Atleta demonstrativo (dados fictícios). Capitão de equipe de Valorant.', NULL, NULL),
(10, 'Júlia Ramos',     'Juju',    'Atleta demonstrativa (dados fictícios). Jogadora de Valorant.', NULL, NULL),
(11, 'Kauê Ferraz',     'Kaw',     'Atleta demonstrativo (dados fictícios). Jogador de Valorant.', NULL, NULL),
(12, 'Larissa Dias',    'Lari',    'Atleta demonstrativa (dados fictícios). Jogadora de Valorant.', NULL, NULL);

-- ---------------------------------------------------------------------
-- EQUIPE_ATLETAS (N:N). O atleta 2 (Bruno) está em duas equipes.
-- ---------------------------------------------------------------------
INSERT INTO equipe_atletas (equipe_id, atleta_id, funcao) VALUES
(1, 1,  'Ala'),
(1, 2,  'Fixo'),
(2, 3,  'Goleira'),
(2, 4,  'Pivô'),
(3, 5,  'Ala'),
(3, 6,  'Fixa'),
(4, 7,  'Goleiro'),
(4, 8,  'Pivô'),
(5, 2,  'Duelista'),
(5, 9,  'Capitão'),
(6, 10, 'Sentinela'),
(7, 11, 'Iniciador'),
(8, 12, 'Duelista');

-- ---------------------------------------------------------------------
-- CAMPEONATOS (edições). Mostra os três status possíveis.
-- ---------------------------------------------------------------------
INSERT INTO campeonatos (id, nome, edicao, modalidade_id, data_inicio, data_fim, status, descricao) VALUES
(1, 'Copa AGON de Futsal', 2026, 2,  '2026-11-14', '2026-12-12', 'em_andamento', 'Campeonato demonstrativo de futsal com fase de grupos.'),
(2, 'Copa AGON de Futsal', 2025, 2,  '2025-11-29', '2025-12-06', 'encerrado',    'Edição anterior demonstrativa da Copa AGON de Futsal.'),
(3, 'Liga AGON Valorant',  2027, 11, '2027-01-16', '2027-02-20', 'planejado',    'Campeonato demonstrativo de Valorant, ainda não iniciado.');

-- ---------------------------------------------------------------------
-- CAMPEONATO_EQUIPES (N:N): quem participa de cada campeonato
-- ---------------------------------------------------------------------
INSERT INTO campeonato_equipes (campeonato_id, equipe_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3),
(3, 5), (3, 6), (3, 7), (3, 8);

-- ---------------------------------------------------------------------
-- PARTIDAS (todas demonstrativas = TRUE)
-- Copa 2026: 4 equipes em fase de grupos (todos contra todos, 3 rodadas).
-- As duas primeiras rodadas já têm resultado; a terceira está agendada.
-- ---------------------------------------------------------------------
INSERT INTO partidas (id, campeonato_id, equipe_casa_id, equipe_visitante_id, data_hora, fase, placar_casa, placar_visitante, status, demonstrativo) VALUES
-- Copa AGON de Futsal 2026
(1, 1, 1, 2, '2026-11-14 20:00', 'Fase de grupos', 3, 2,    'finalizada', TRUE),
(2, 1, 3, 4, '2026-11-14 21:30', 'Fase de grupos', 1, 1,    'finalizada', TRUE),
(3, 1, 1, 3, '2026-11-21 20:00', 'Fase de grupos', 2, 0,    'finalizada', TRUE),
(4, 1, 2, 4, '2026-11-21 21:30', 'Fase de grupos', 4, 3,    'finalizada', TRUE),
(5, 1, 1, 4, '2026-11-28 20:00', 'Fase de grupos', NULL, NULL, 'agendada',   TRUE),
(6, 1, 2, 3, '2026-11-28 21:30', 'Fase de grupos', NULL, NULL, 'agendada',   TRUE),
-- Copa AGON de Futsal 2025 (edição encerrada)
(7, 2, 1, 2, '2025-12-06 18:00', 'Final',          2, 1,    'finalizada', TRUE),
-- Liga AGON Valorant 2027 (ainda não iniciada)
(8, 3, 5, 6, '2027-01-16 19:00', 'Fase de grupos', NULL, NULL, 'agendada',   TRUE),
(9, 3, 7, 8, '2027-01-16 21:00', 'Fase de grupos', NULL, NULL, 'agendada',   TRUE);

-- ---------------------------------------------------------------------
-- NOTICIAS (conteúdo demonstrativo), escritas pela conta "Redação AGON" (id 1)
-- ---------------------------------------------------------------------
INSERT INTO noticias (id, titulo, resumo, conteudo, imagem_url, autor_id, publicado_em) VALUES
(1, 'Bem-vindo ao AGON Hub',
    'Conheça a plataforma que reúne esporte e e-sports em um só lugar.',
    'Conteúdo demonstrativo. O AGON Hub reúne equipes, atletas, campeonatos, partidas e notícias do Universo AGON. Mais que competição, um universo.',
    NULL, 1, '2026-11-05 12:00'),
(2, 'Copa AGON de Futsal 2026 começa com quatro equipes',
    'A fase de grupos da edição 2026 está em andamento.',
    'Conteúdo demonstrativo. A Copa AGON de Futsal 2026 reúne quatro equipes na fase de grupos. Os resultados exibidos no sistema são fictícios.',
    NULL, 1, '2026-11-15 14:00'),
(3, 'Liga AGON Valorant 2027 já tem equipes definidas',
    'Quatro equipes disputarão a primeira edição da liga.',
    'Conteúdo demonstrativo. A Liga AGON Valorant 2027 está planejada para o início de 2027 e terá quatro equipes participantes.',
    NULL, 1, '2026-11-10 10:00'),
(4, 'Equipes reais e fictícias convivem no Universo AGON',
    'O sistema distingue os dois tipos de equipe.',
    'Conteúdo demonstrativo. No AGON Hub, cada equipe é classificada como real ou fictícia, para que o público saiba do que se trata.',
    NULL, 1, '2026-11-22 09:30');

-- ---------------------------------------------------------------------
-- Acerta os contadores (sequences) dos campos SERIAL.
-- Como inserimos os "id" manualmente, sem isso o próximo cadastro feito
-- pelo sistema tentaria usar id = 1 e daria erro de chave duplicada.
-- ---------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('usuarios',    'id'), (SELECT MAX(id) FROM usuarios));
SELECT setval(pg_get_serial_sequence('modalidades', 'id'), (SELECT MAX(id) FROM modalidades));
SELECT setval(pg_get_serial_sequence('equipes',     'id'), (SELECT MAX(id) FROM equipes));
SELECT setval(pg_get_serial_sequence('atletas',     'id'), (SELECT MAX(id) FROM atletas));
SELECT setval(pg_get_serial_sequence('campeonatos', 'id'), (SELECT MAX(id) FROM campeonatos));
SELECT setval(pg_get_serial_sequence('partidas',    'id'), (SELECT MAX(id) FROM partidas));
SELECT setval(pg_get_serial_sequence('noticias',    'id'), (SELECT MAX(id) FROM noticias));

COMMIT;
