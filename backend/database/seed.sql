BEGIN;
SET client_encoding = 'UTF8';

INSERT INTO roles (name) VALUES ('user'), ('admin') ON CONFLICT (name) DO NOTHING;

INSERT INTO organizations (name, short_name, slug, description, logo_url, country, is_fictional) VALUES
    ('Universo AGON', 'AGON', 'universo-agon', 'Central fictícia do Universo AGON; organizadora das competições próprias.', '/uploads/organizations/agon.png', 'Brasil', TRUE),
    ('Federação Universitária Paulista de Esportes', 'FUPE', 'fupe', 'Organização associada ao nível estadual no modelo do AGON Hub.', '/uploads/organizations/fupe.png', 'Brasil', FALSE),
    ('Novo Desporto Universitário', 'NDU', 'ndu', 'Organização nacional de desporto universitário indicada para o ecossistema competitivo.', '/uploads/organizations/ndu.png', 'Brasil', FALSE),
    ('Confederação Brasileira do Desporto Universitário', 'CBDU', 'cbdu', 'Organização nacional ligada aos Jogos Universitários Brasileiros.', '/uploads/organizations/cbdu.png', 'Brasil', FALSE),
    ('International University Sports Federation', 'FISU', 'fisu', 'Organização internacional do desporto universitário.', '/uploads/organizations/fisu.png', 'Internacional', FALSE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO competition_levels (name, short_name, slug, sequence, description) VALUES
    ('AGON', 'AGON', 'agon', 1, 'Nível competitivo próprio do Universo AGON.'),
    ('Estadual', 'EST', 'estadual', 2, 'Competições de nível estadual.'),
    ('Nacional', 'NAC', 'nacional', 3, 'Competições de nível nacional.'),
    ('Mundial', 'MUN', 'mundial', 4, 'Competições de nível mundial.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO institutions (name, short_name, slug, type, city, state, country, is_fictional) VALUES
    ('Instituto Federal de São Paulo - Campus São Paulo', 'IFSP São Paulo', 'ifsp-sao-paulo', 'INSTITUTE', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Universidade Presbiteriana Mackenzie', 'Mackenzie', 'mackenzie', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Universidade de Mogi das Cruzes', 'UMC', 'umc', 'UNIVERSITY', 'Mogi das Cruzes', 'SP', 'Brasil', FALSE),
    ('Centro Universitário Sant’Anna', 'Uni Sant’Anna', 'uni-santanna', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Universidade Federal de São Carlos', 'UFSCar', 'ufscar', 'UNIVERSITY', 'São Carlos', 'SP', 'Brasil', FALSE),
    ('Universidade Anhanguera - Unidade Piracicaba', 'Anhanguera Piracicaba', 'anhanguera-piracicaba', 'UNIVERSITY', 'Piracicaba', 'SP', 'Brasil', FALSE),
    ('Universidade de São Paulo', 'USP', 'usp', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Universidade de São Paulo - Campus São Carlos', 'USP São Carlos', 'usp-sao-carlos', 'UNIVERSITY_CAMPUS', 'São Carlos', 'SP', 'Brasil', FALSE),
    ('Universidade de São Paulo - Campus Ribeirão Preto', 'USP Ribeirão Preto', 'usp-ribeirao-preto', 'UNIVERSITY_CAMPUS', 'Ribeirão Preto', 'SP', 'Brasil', FALSE),
    ('Universidade de Ribeirão Preto', 'UNAERP', 'unaerp', 'UNIVERSITY', 'Ribeirão Preto', 'SP', 'Brasil', FALSE),
    ('Pontifícia Universidade Católica de Campinas', 'PUCCAMP', 'puccamp', 'UNIVERSITY', 'Campinas', 'SP', 'Brasil', FALSE),
    ('Universidade Estadual Paulista - Campus Rio Claro', 'UNESP Rio Claro', 'unesp-rio-claro', 'UNIVERSITY_CAMPUS', 'Rio Claro', 'SP', 'Brasil', FALSE),
    ('Universidade Federal do ABC', 'UFABC', 'ufabc', 'UNIVERSITY', 'Santo André', 'SP', 'Brasil', FALSE),
    ('Universidade Metodista de São Paulo', 'Metodista', 'metodista', 'UNIVERSITY', 'São Bernardo do Campo', 'SP', 'Brasil', FALSE),
    ('Universidade Estadual de Campinas', 'UNICAMP', 'unicamp', 'UNIVERSITY', 'Campinas', 'SP', 'Brasil', FALSE),
    ('Fundação Getulio Vargas', 'FGV', 'fgv', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Faculdade Israelita de Ciências da Saúde Albert Einstein', 'Medicina Einstein', 'einstein', 'SCHOOL', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Escola Superior de Propaganda e Marketing', 'ESPM', 'espm', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Insper Instituto de Ensino e Pesquisa', 'Insper', 'insper', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Instituto Tecnológico de Aeronáutica', 'ITA', 'ita', 'INSTITUTE', 'São José dos Campos', 'SP', 'Brasil', FALSE),
    ('Pontifícia Universidade Católica de São Paulo', 'PUC-SP', 'puc-sp', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Faculdade de Ciências Médicas da Santa Casa de São Paulo', 'Santa Casa', 'santa-casa-sp', 'SCHOOL', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Faculdade de Medicina do ABC', 'Medicina ABC', 'fmabc', 'SCHOOL', 'Santo André', 'SP', 'Brasil', FALSE),
    ('Universidade Municipal de São Caetano do Sul', 'USCS', 'uscs', 'UNIVERSITY', 'São Caetano do Sul', 'SP', 'Brasil', FALSE),
    ('Faculdade de Direito de São Bernardo do Campo', 'Direito SBC', 'direito-sbc', 'SCHOOL', 'São Bernardo do Campo', 'SP', 'Brasil', FALSE),
    ('IBMEC', 'IBMEC', 'ibmec', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Centro Universitário FEI', 'FEI', 'fei', 'UNIVERSITY', 'São Bernardo do Campo', 'SP', 'Brasil', FALSE),
    ('Universidade Paulista', 'UNIP', 'unip', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Fundação Escola de Comércio Álvares Penteado', 'FECAP', 'fecap', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Centro Universitário Barão de Mauá', 'Barão de Mauá', 'barao-de-maua', 'UNIVERSITY', 'Ribeirão Preto', 'SP', 'Brasil', FALSE),
    ('Centro Universitário Belas Artes de São Paulo', 'Belas Artes', 'belas-artes', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Universidade Cesumar', 'Unicesumar', 'unicesumar', 'UNIVERSITY', 'Maringá', 'PR', 'Brasil', FALSE),
    ('Universidade Federal de Uberlândia', 'UFU', 'ufu', 'UNIVERSITY', 'Uberlândia', 'MG', 'Brasil', FALSE),
    ('Universidade Federal de Goiás', 'UFG', 'ufg', 'UNIVERSITY', 'Goiânia', 'GO', 'Brasil', FALSE),
    ('Universidade do Estado de Minas Gerais', 'UEMG', 'uemg', 'UNIVERSITY', 'Belo Horizonte', 'MG', 'Brasil', FALSE),
    ('Faculdade Cásper Líbero', 'Cásper Líbero', 'casper-libero', 'SCHOOL', 'São Paulo', 'SP', 'Brasil', FALSE),
    ('Universidade São Judas Tadeu', 'São Judas', 'sao-judas', 'UNIVERSITY', 'São Paulo', 'SP', 'Brasil', FALSE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO teams (name, short_name, slug, team_type, is_fictional) VALUES
    ('Turquia', 'TUR', 'turquia', 'FICTIONAL', TRUE),
    ('Rússia', 'RUS', 'russia', 'FICTIONAL', TRUE),
    ('Holanda', 'HOL', 'holanda', 'FICTIONAL', TRUE),
    ('França', 'FRA', 'franca', 'FICTIONAL', TRUE),
    ('Grota', 'GRO', 'grota', 'FICTIONAL', TRUE),
    ('Tropa dos Laranjas', 'N$', 'tropa-dos-laranjas', 'FICTIONAL', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'IFSP São Paulo', 'IFSP-SP', 'ifsp-sao-paulo-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ifsp-sao-paulo') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ifsp-sao-paulo-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Mackenzie', 'MACK', 'mackenzie-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'mackenzie-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'UMC', 'UMC', 'umc-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'umc') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'umc-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Uni Sant’Anna', 'UNI-SANTANNA', 'uni-santanna-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'uni-santanna') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'uni-santanna-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LAAUSP', 'LAAUSP', 'laausp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'laausp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'CAASO', 'CAASO', 'caaso', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp-sao-carlos') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'caaso');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LAUNAERP', 'LAUNAERP', 'launaerp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unaerp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'launaerp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LAURP', 'LAURP', 'laurp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp-ribeirao-preto') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'laurp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'UFSCar', 'UFSCAR', 'ufscar-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ufscar') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ufscar-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Anhanguera Piracicaba', 'ANH-PIR', 'anhanguera-piracicaba-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'anhanguera-piracicaba') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'anhanguera-piracicaba-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LAP PUCCAMP', 'LAP', 'lap-puccamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'lap-puccamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'UNESP Rio Claro', 'UNESP-RC', 'unesp-rio-claro-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unesp-rio-claro') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'unesp-rio-claro-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Axis UFABC', 'AXIS', 'axis-ufabc', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ufabc') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'axis-ufabc');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Metodista', 'METODISTA', 'metodista-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'metodista') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'metodista-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'CAAP UFABC', 'CAAP', 'caap-ufabc', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ufabc') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'caap-ufabc');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Engenharia Mackenzie', 'ENG-MACK', 'engenharia-mackenzie', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'engenharia-mackenzie');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LEU UNICAMP', 'LEU', 'leu-unicamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unicamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'leu-unicamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'PoliUSP', 'POLIUSP', 'poliusp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'poliusp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Sanfran', 'SANFRAN', 'sanfran', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'sanfran');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FFLCH USP', 'FFLCH', 'fflch-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fflch-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FGV', 'FGV', 'fgv-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'fgv') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fgv-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Medicina Einstein', 'MED-EINSTEIN', 'medicina-einstein', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'einstein') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'medicina-einstein');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FAU Mackenzie', 'FAU-MACK', 'fau-mackenzie', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fau-mackenzie');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FAU USP', 'FAU-USP', 'fau-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fau-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'ICBio USP', 'ICBIO', 'icbio-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'icbio-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'EACH USP', 'EACH', 'each-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'each-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LEP Mackenzie', 'LEP-MACK', 'lep-mackenzie', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'lep-mackenzie');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'ESPM', 'ESPM', 'espm-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'espm') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'espm-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'ECA USP', 'ECA', 'eca-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'eca-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Insper', 'INSPER', 'insper-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'insper') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'insper-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Educa USP RP', 'EDUCA-RP', 'educa-usp-rp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp-ribeirao-preto') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'educa-usp-rp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Direito PUCCAMP', 'DIR-PUCCAMP', 'direito-puccamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'direito-puccamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'CEM UNICAMP', 'CEM', 'cem-unicamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unicamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'cem-unicamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FEA USP', 'FEA', 'fea-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fea-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'LEP PUCCAMP', 'LEP-PUCCAMP', 'lep-puccamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'lep-puccamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Faceca PUCCAMP', 'FACECA', 'faceca-puccamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'faceca-puccamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'EEFE USP', 'EEFE', 'eefe-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'eefe-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Cásper Líbero', 'CASPER', 'casper-libero-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'casper-libero') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'casper-libero-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'IME USP', 'IME', 'ime-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ime-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Economia Mackenzie', 'ECON-MACK', 'economia-mackenzie', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'economia-mackenzie');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Fisioterapia Santa Casa', 'FISIO-SC', 'fisioterapia-santa-casa', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'santa-casa-sp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fisioterapia-santa-casa');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Comunicação PUCCAMP', 'COM-PUCCAMP', 'comunicacao-puccamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'comunicacao-puccamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Direito Mackenzie', 'DIR-MACK', 'direito-mackenzie', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'direito-mackenzie');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FEF UNICAMP', 'FEF', 'fef-unicamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unicamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fef-unicamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Engenharia São Judas', 'ENG-SJ', 'engenharia-sao-judas', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'sao-judas') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'engenharia-sao-judas');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Medicina PUCCAMP', 'MED-PUCCAMP', 'medicina-puccamp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'medicina-puccamp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Direito PUC SP', 'DIR-PUCSP', 'direito-puc-sp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puc-sp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'direito-puc-sp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'ITA', 'ITA', 'ita-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ita') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ita-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Medicina Santa Casa', 'MED-SC', 'medicina-santa-casa', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'santa-casa-sp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'medicina-santa-casa');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Medicina ABC', 'MED-ABC', 'medicina-abc', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'fmabc') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'medicina-abc');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Medicina USP', 'MED-USP', 'medicina-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'medicina-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Geral USCS', 'GERAL-USCS', 'geral-uscs', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'uscs') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'geral-uscs');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Direito SBC', 'DIR-SBC', 'direito-sbc-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'direito-sbc') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'direito-sbc-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Medicina PUC SP', 'MED-PUCSP', 'medicina-puc-sp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puc-sp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'medicina-puc-sp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'IBMEC', 'IBMEC', 'ibmec-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ibmec') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ibmec-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FEI', 'FEI', 'fei-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'fei') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fei-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'UNIP', 'UNIP', 'unip-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unip') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'unip-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FECAP', 'FECAP', 'fecap-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'fecap') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fecap-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Barão de Mauá', 'BARAO', 'barao-de-maua-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'barao-de-maua') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'barao-de-maua-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Arquitetura Mackenzie', 'ARQ-MACK', 'arquitetura-mackenzie', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'mackenzie') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'arquitetura-mackenzie');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Grifo', 'GRIFO', 'grifo', 'OTHER', FALSE, NULL WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'grifo');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FEA PUC', 'FEA-PUC', 'fea-puc', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puccamp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fea-puc');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Belas Artes', 'BELAS-ARTES', 'belas-artes-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'belas-artes') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'belas-artes-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FEA Odonto', 'FEA-ODONTO', 'fea-odonto', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fea-odonto');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'EACH USP B', 'EACH-B', 'each-usp-b', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'each-usp-b');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Unicesumar', 'UNICESUMAR', 'unicesumar-team', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'unicesumar') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'unicesumar-team');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Farma USP', 'FARMA-USP', 'farma-usp', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'farma-usp');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'UFU MG', 'UFU', 'ufu-mg', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ufu') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ufu-mg');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'FGV B', 'FGV-B', 'fgv-b', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'fgv') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'fgv-b');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'UFG GO', 'UFG', 'ufg-go', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'ufg') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ufg-go');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Direito PUC SP B', 'DIR-PUCSP-B', 'direito-puc-sp-b', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'puc-sp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'direito-puc-sp-b');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'PoliUSP B', 'POLIUSP-B', 'poliusp-b', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'usp') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'poliusp-b');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Atena (UEMG)', 'ATENA', 'atena-uemg', 'ATHLETIC', FALSE, (SELECT id FROM institutions WHERE slug = 'uemg') WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'atena-uemg');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'Araras', 'ARARAS', 'araras', 'OTHER', FALSE, NULL WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'araras');
INSERT INTO teams (name, short_name, slug, team_type, is_fictional, institution_id) SELECT 'IX Novembro', 'IX-NOV', 'ix-novembro', 'OTHER', FALSE, NULL WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'ix-novembro');

INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'TDT', 'COMPETITIVE', TRUE FROM teams t WHERE t.slug = 'turquia' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'TDT');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'TUR', 'SHORT_NAME', FALSE FROM teams t WHERE t.slug = 'turquia' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'TUR');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'TDR', 'COMPETITIVE', TRUE FROM teams t WHERE t.slug = 'russia' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'TDR');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'RUS', 'SHORT_NAME', FALSE FROM teams t WHERE t.slug = 'russia' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'RUS');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'TDH', 'COMPETITIVE', TRUE FROM teams t WHERE t.slug = 'holanda' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'TDH');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'HOL', 'SHORT_NAME', FALSE FROM teams t WHERE t.slug = 'holanda' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'HOL');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'TDF', 'COMPETITIVE', TRUE FROM teams t WHERE t.slug = 'franca' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'TDF');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'FRA', 'SHORT_NAME', FALSE FROM teams t WHERE t.slug = 'franca' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'FRA');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'JPD', 'ALIAS', FALSE FROM teams t WHERE t.slug = 'franca' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'JPD');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'TDG', 'COMPETITIVE', TRUE FROM teams t WHERE t.slug = 'grota' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'TDG');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'GRO', 'SHORT_NAME', FALSE FROM teams t WHERE t.slug = 'grota' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'GRO');
INSERT INTO team_identifiers (team_id, identifier, identifier_type, is_primary) SELECT t.id, 'N$', 'COMPETITIVE', TRUE FROM teams t WHERE t.slug = 'tropa-dos-laranjas' AND NOT EXISTS (SELECT 1 FROM team_identifiers ti WHERE ti.team_id = t.id AND ti.identifier = 'N$');

INSERT INTO sports (name, short_name, slug) VALUES
    ('Atletismo', 'ATL', 'atletismo'),
    ('Basquete', 'BAS', 'basquete'),
    ('Beisebol', 'BEI', 'beisebol'),
    ('Futebol', 'FUT', 'futebol'),
    ('Futsal', 'FSL', 'futsal'),
    ('Handebol', 'HAN', 'handebol'),
    ('Jiu-jitsu', 'JIU', 'jiu-jitsu'),
    ('Judô', 'JUD', 'judo'),
    ('Karatê', 'KAR', 'karate'),
    ('Natação', 'NAT', 'natacao'),
    ('Polo aquático', 'POL', 'polo-aquatico'),
    ('Rugby Sevens', 'RUG', 'rugby-sevens'),
    ('Softbol', 'SOF', 'softbol'),
    ('Taekwondo', 'TAE', 'taekwondo'),
    ('Tênis de campo', 'TEN', 'tenis-de-campo'),
    ('Tênis de mesa', 'TDM', 'tenis-de-mesa'),
    ('Voleibol', 'VOL', 'voleibol'),
    ('Vôlei de areia', 'VDA', 'volei-de-areia'),
    ('Xadrez', 'XAD', 'xadrez'),
    ('Jogos eletrônicos', 'ESP', 'jogos-eletronicos'),
    ('Queimada', 'QUE', 'queimada'),
    ('Pique-bandeira', 'PIQ', 'pique-bandeira')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, category_type, gender, age_group, min_age, max_age, format, weight_class, description) VALUES
    ('Masculino', 'masculino', 'GENDER', 'MALE', NULL, NULL, NULL, NULL, NULL, 'Categoria masculina.'),
    ('Feminino', 'feminino', 'GENDER', 'FEMALE', NULL, NULL, NULL, NULL, NULL, 'Categoria feminina.'),
    ('Misto', 'misto', 'GENDER', 'MIXED', NULL, NULL, NULL, NULL, NULL, 'Categoria mista.'),
    ('Absoluto', 'absoluto', 'OPEN', 'OPEN', NULL, NULL, NULL, NULL, NULL, 'Categoria absoluta/aberta.'),
    ('Sub-18', 'sub-18', 'AGE', NULL, 'Sub-18', NULL, 17, NULL, NULL, 'Categoria etária até 17 anos; aplicar conforme regulamento.'),
    ('Duplas', 'duplas', 'FORMAT', NULL, NULL, NULL, NULL, 'PAIR', NULL, 'Formato de duplas.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO games (name, short_name, slug) VALUES
    ('Mobile Legends: Bang Bang', 'MLBB', 'mobile-legends-bang-bang'),
    ('Counter-Strike', 'CS', 'counter-strike'),
    ('Counter-Strike 2', 'CS2', 'counter-strike-2'),
    ('League of Legends', 'LoL', 'league-of-legends'),
    ('Dota', 'DOTA', 'dota'),
    ('Dota 2', 'DOTA2', 'dota-2'),
    ('PUBG', 'PUBG', 'pubg'),
    ('Valorant', 'VAL', 'valorant'),
    ('Fortnite', 'FN', 'fortnite'),
    ('Free Fire', 'FF', 'free-fire'),
    ('Honor of Kings', 'HOK', 'honor-of-kings'),
    ('Arena of Valor', 'AOV', 'arena-of-valor'),
    ('Rocket League', 'RL', 'rocket-league'),
    ('Apex Legends', 'APEX', 'apex-legends'),
    ('Overwatch', 'OW', 'overwatch'),
    ('Call of Duty', 'COD', 'call-of-duty'),
    ('Street Fighter', 'SF', 'street-fighter'),
    ('Brawl Stars', 'BS', 'brawl-stars'),
    ('FIFA', 'FIFA', 'fifa'),
    ('PES', 'PES', 'pes')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (name, username, email, password_hash, bio, role_id) SELECT v.name, v.username, v.email, v.password_hash, v.bio, r.id FROM (VALUES ('Administrador AGON Hub','agon.admin','admin@agonhub.local','$2b$10$Idaq/J8OdwQ2FNudUGDIuOT7pjFvlz5TiAVAG5b12kuavUCmddx1C','Conta de demonstração local; trocar credenciais antes da publicação.','admin'), ('Usuário Demo','agon.demo','demo@agonhub.local','$2b$10$bjHzcqhsKd/KmvdS9SlxZOW4/bYt6VWL69q6S9Oh0YfjCGQqKGSwS','Conta de demonstração para testar interações.','user')) AS v(name, username, email, password_hash, bio, role_name) JOIN roles r ON r.name = v.role_name WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.username = v.username);

CREATE TEMP TABLE seed_athletes (slug TEXT PRIMARY KEY, display_name TEXT NOT NULL, team_slug TEXT NOT NULL, age_at_reference INTEGER NOT NULL, gamer_username TEXT, generation TEXT, group_name TEXT, leadership_role TEXT, bio TEXT) ON COMMIT DROP;
INSERT INTO seed_athletes (slug, display_name, team_slug, age_at_reference, gamer_username, generation, group_name, leadership_role, bio) VALUES
    ('alicia-turquia', 'Alicia', 'turquia', 16, 'Tur_Alicia', NULL, NULL, NULL, NULL),
    ('anna-beatriz-turquia', 'Anna Beatriz', 'turquia', 16, 'Tur_ABeatriz', NULL, NULL, NULL, NULL),
    ('camila-turquia', 'Camila', 'turquia', 16, 'Tur_Camis', NULL, NULL, NULL, NULL),
    ('gabriel-cesar-turquia', 'Gabriel Cesar', 'turquia', 16, 'TdT_Cesar', 'FIRST_GENERATION', NULL, 'LEADER', NULL),
    ('geovane-turquia', 'Geovane', 'turquia', 16, 'Tur_Rui', NULL, NULL, NULL, NULL),
    ('gustavo-turquia', 'Gustavo', 'turquia', 16, 'Tur_Jorge', NULL, NULL, NULL, NULL),
    ('jeniffer-turquia', 'Jeniffer', 'turquia', 16, 'Tur_Velasco', NULL, NULL, NULL, NULL),
    ('luis-gustavo-turquia', 'Luís Gustavo', 'turquia', 16, 'Tur_LGustavo', NULL, NULL, NULL, NULL),
    ('maria-eduarda-silva-turquia', 'Maria Eduarda Silva', 'turquia', 16, 'Tur_Silva', NULL, NULL, NULL, NULL),
    ('maria-eduarda-napolitano-turquia', 'Maria Eduarda Napolitano', 'turquia', 15, 'Tur_Napoli', NULL, NULL, NULL, NULL),
    ('mariana-turquia', 'Mariana', 'turquia', 16, 'Tur_Ymariix', NULL, NULL, NULL, NULL),
    ('mariane-turquia', 'Mariane', 'turquia', 16, 'Tur_Mariane', NULL, NULL, NULL, NULL),
    ('rafaela-turquia', 'Rafaela', 'turquia', 16, 'Tur_Rafaela', NULL, NULL, NULL, NULL),
    ('ryan-eduardo-turquia', 'Ryan Eduardo', 'turquia', 16, 'Tur_Ryanzin', NULL, NULL, NULL, NULL),
    ('luiz-guilherme-turquia', 'Luiz Guilherme', 'turquia', 16, 'Tur_Guilherme', NULL, NULL, NULL, NULL),
    ('sarah-turquia', 'Sarah', 'turquia', 16, 'Tur_Sarah', NULL, NULL, NULL, NULL),
    ('tom-turquia', 'Tom', 'turquia', 16, 'TdT_Ferreira', 'SECOND_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('isabella-nascimento-turquia', 'Isabella Nascimento', 'turquia', 16, 'Tur_Nascimento', NULL, NULL, NULL, NULL),
    ('isabella-garcia-turquia', 'Isabella Garcia', 'turquia', 16, 'TdT_Garcia', 'SECOND_GENERATION', NULL, 'LEADER', NULL),
    ('maria-clara-turquia', 'Maria Clara', 'turquia', 16, 'TdT_MClara', 'FIRST_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('arianne-grota', 'Arianne', 'grota', 17, 'TdG_Anayandra', 'FIRST_GENERATION', NULL, 'LEADER', NULL),
    ('anna-clara-grota', 'Anna Clara', 'grota', 17, 'Gro_Anna', NULL, NULL, NULL, NULL),
    ('ana-grota', 'Ana', 'grota', 17, 'Gro_Ana', NULL, NULL, NULL, NULL),
    ('samara-grota', 'Samara', 'grota', 17, 'TdG_Samara', 'SECOND_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('heloyza-grota', 'Heloyza', 'grota', 17, 'Gro_Helo', NULL, NULL, NULL, NULL),
    ('heloise-grota', 'Heloise', 'grota', 17, 'Gro_Loise', NULL, NULL, NULL, NULL),
    ('ash-grota', 'Ash', 'grota', 17, 'Gro_Ash', NULL, NULL, NULL, NULL),
    ('max-grota', 'Max', 'grota', 17, 'Gro_Max', NULL, NULL, NULL, NULL),
    ('karol-grota', 'Karol', 'grota', 17, 'Gro_Autum', NULL, NULL, NULL, NULL),
    ('adriano-grota', 'Adriano', 'grota', 17, 'Gro_Adriano', NULL, NULL, NULL, NULL),
    ('thales-grota', 'Thales', 'grota', 17, 'TdG_Tale', 'SECOND_GENERATION', NULL, 'LEADER', NULL),
    ('milena-grota', 'Milena', 'grota', 17, 'Gro_Mih', NULL, NULL, NULL, NULL),
    ('leonardo-grota', 'Leonardo', 'grota', 17, 'Gro_Leon', NULL, NULL, NULL, NULL),
    ('matheus-grota', 'Matheus', 'grota', 17, 'Gro_Math', NULL, NULL, NULL, NULL),
    ('luis-otavio-grota', 'Luis Otavio', 'grota', 17, 'TdG_Lotavio', 'FIRST_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('stefany-grota', 'Stéfany', 'grota', 17, 'Gro_Stefany', NULL, NULL, NULL, NULL),
    ('julia-grota', 'Julia', 'grota', 17, 'Gro_Julia', NULL, NULL, NULL, NULL),
    ('pietra-grota', 'Pietra', 'grota', 17, 'Gro_Pietra', NULL, NULL, NULL, NULL),
    ('vitoria-grota', 'Vitoria', 'grota', 17, 'Gro_Vih', NULL, NULL, NULL, NULL),
    ('maria-eduarda-grota', 'Maria Eduarda', 'grota', 17, 'Gro_Duda', NULL, NULL, NULL, NULL),
    ('aline-franca', 'Aline', 'franca', 19, 'Fra_Line', NULL, NULL, NULL, NULL),
    ('annika-franca', 'Annika', 'franca', 18, 'TdF_Nika', 'SECOND_GENERATION', NULL, 'LEADER', NULL),
    ('clara-franca', 'Clara', 'franca', 16, 'TdF_Nunes', 'FIRST_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('ester-franca', 'Ester', 'franca', 27, 'Fra_Laura', NULL, NULL, NULL, NULL),
    ('filipe-franca', 'Filipe', 'franca', 14, 'Fra_Lipe', NULL, NULL, NULL, NULL),
    ('gabriel-guarnieri-franca', 'Gabriel Guarnieri', 'franca', 16, 'Fra_Guarnieri', NULL, NULL, NULL, NULL),
    ('heloisa-franca', 'Heloisa', 'franca', 14, 'Fra_Luna', NULL, NULL, NULL, NULL),
    ('izabella-franca', 'Izabella', 'franca', 13, 'Fra_Bella', NULL, NULL, NULL, NULL),
    ('isabelly-franca', 'Isabelly', 'franca', 13, 'Fra_Belly', NULL, NULL, NULL, NULL),
    ('levi-franca', 'Levi', 'franca', 16, 'TdF_Souzxs', 'FIRST_GENERATION', NULL, 'LEADER', NULL),
    ('matheus-ryan-franca', 'Matheus Ryan', 'franca', 21, 'Fra_Mathryan', NULL, NULL, NULL, NULL),
    ('miguel-franca', 'Miguel', 'franca', 20, 'Fra_Miguel', NULL, NULL, NULL, NULL),
    ('raphael-franca', 'Raphael', 'franca', 22, 'TdF_Raph', 'SECOND_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('lavinia-franca', 'Lavinia', 'franca', 11, 'Fra_Vinia', NULL, NULL, NULL, NULL),
    ('leticia-franca', 'Leticia', 'franca', 16, 'Fra_Lehh', NULL, NULL, NULL, NULL),
    ('luana-franca', 'Luana', 'franca', 22, 'Fra_Luhh', NULL, NULL, NULL, NULL),
    ('murilo-gabriel-franca', 'Murilo Gabriel', 'franca', 17, 'Fra_MuriloG', NULL, NULL, NULL, NULL),
    ('nicolle-franca', 'Nicolle', 'franca', 16, 'Fra_Crescencio', NULL, NULL, NULL, NULL),
    ('kamila-franca', 'Kamila', 'franca', 27, 'Fra_Kamis', NULL, NULL, NULL, NULL),
    ('lukas-franca', 'Lukas', 'franca', 11, 'Fra_Lukas', NULL, NULL, NULL, NULL),
    ('ana-julia-holanda', 'Ana Júlia', 'holanda', 16, 'Hol_AnaJu', NULL, NULL, NULL, NULL),
    ('ana-victoria-holanda', 'Ana Victoria', 'holanda', 16, 'Hol_Monteirox', NULL, NULL, NULL, NULL),
    ('angelica-holanda', 'Angélica', 'holanda', 16, 'Hol_Angelzs', NULL, NULL, NULL, NULL),
    ('beatriz-holanda', 'Beatriz', 'holanda', 16, 'Hol_Bea', NULL, NULL, NULL, NULL),
    ('giovanna-tamara-holanda', 'Giovanna Tamara', 'holanda', 16, 'Hol_Tamara', NULL, NULL, NULL, NULL),
    ('giovanna-martucci-holanda', 'Giovanna Martucci', 'holanda', 16, 'Hol_Martucci', NULL, NULL, NULL, NULL),
    ('geovana-rodrigues-holanda', 'Geovana Rodrigues', 'holanda', 16, 'Hol_Rodrigues', NULL, NULL, NULL, NULL),
    ('higor-souza-holanda', 'Higor Souza', 'holanda', 16, 'TdH_Souza', 'SECOND_GENERATION', NULL, 'LEADER', NULL),
    ('joao-paulo-holanda', 'João Paulo', 'holanda', 16, 'Hol_Borges', NULL, NULL, NULL, NULL),
    ('joao-vitor-holanda', 'João Vitor', 'holanda', 16, 'Hol_JVitor', NULL, NULL, NULL, NULL),
    ('rafaella-franchini-holanda', 'Rafaella Franchini', 'holanda', 16, 'TdH_Rafa', 'FIRST_GENERATION', NULL, 'LEADER', NULL),
    ('julia-moura-holanda', 'Julia Moura', 'holanda', 16, 'Hol_Moura', NULL, NULL, NULL, NULL),
    ('wallace-holanda', 'Wallace', 'holanda', 17, 'TdH_Patolino', 'FIRST_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('thayane-holanda', 'Thayane', 'holanda', 16, 'TdH_Thay', 'SECOND_GENERATION', NULL, 'VICE_LEADER', NULL),
    ('nicole-grundemann-holanda', 'Nicole Grundemann', 'holanda', 16, 'Hol_Nicole', NULL, NULL, NULL, NULL),
    ('paola-silva-holanda', 'Paola Silva', 'holanda', 16, 'Hol_Paola', NULL, NULL, NULL, NULL),
    ('sthefany-holanda', 'Sthefany', 'holanda', 16, 'Hol_Smg', NULL, NULL, NULL, NULL),
    ('vitoria-karoline-holanda', 'Vitória Karoline', 'holanda', 16, 'Hol_VKaroline', NULL, NULL, NULL, NULL),
    ('ryan-emanuel-holanda', 'Ryan Emanuel', 'holanda', 16, 'Hol_Ryanzk', NULL, NULL, NULL, NULL),
    ('pedro-mangerona-holanda', 'Pedro Mangerona', 'holanda', 16, 'Hol_Mangerona', NULL, NULL, NULL, NULL),
    ('isabella-russia', 'Isabella', 'russia', 15, 'TdR_Bella', 'FIRST_GENERATION', NULL, 'LEADER', NULL),
    ('maria-fernanda-russia', 'Maria Fernanda', 'russia', 13, 'Rus_Sun', NULL, NULL, NULL, NULL),
    ('laura-guimaraes-russia', 'Laura Guimarães', 'russia', 14, 'Rus_LGuimarães', NULL, NULL, NULL, NULL),
    ('vitoria-russia', 'Vitória', 'russia', 15, 'Rus_Vivih', NULL, NULL, NULL, NULL),
    ('pietra-camilly-russia', 'Pietra Camilly', 'russia', 15, 'TdR_Piih', NULL, '1ª Divisão', 'VICE_LEADER', NULL),
    ('ana-luisa-russia', 'Ana Luísa', 'russia', 14, 'Rus_ALuisa', NULL, NULL, NULL, NULL),
    ('livia-russia', 'Lívia', 'russia', 13, 'Rus_Bovina', NULL, NULL, NULL, NULL),
    ('geovanna-rocha-russia', 'Geovanna Rocha', 'russia', 15, 'Rus_GRocha', NULL, NULL, NULL, NULL),
    ('victoria-russia', 'Victoria', 'russia', 13, 'Rus_Vic', NULL, NULL, NULL, NULL),
    ('carolliny-baldan-russia', 'Carolliny Baldan', 'russia', 15, 'Rus_Baldan', NULL, NULL, NULL, NULL),
    ('thailane-russia', 'Thailane', 'russia', 15, 'Rus_Thai', NULL, NULL, NULL, NULL),
    ('thauany-russia', 'Thauany', 'russia', 13, 'Rus_Tata', NULL, NULL, NULL, NULL),
    ('enzo-russia', 'Enzo', 'russia', 15, 'Rus_Andrade', NULL, NULL, NULL, NULL),
    ('breno-russia', 'Breno', 'russia', 15, 'Rus_Brenoka', NULL, NULL, NULL, NULL),
    ('bianny-couto-russia', 'Bianny Couto', 'russia', 15, 'Rus_BiaCouto', NULL, NULL, NULL, NULL),
    ('emanueli-russia', 'Emanueli', 'russia', 17, 'Rus_Manu', NULL, NULL, NULL, NULL),
    ('kauan-russia', 'Kauan', 'russia', 15, 'Rus_Kauan', NULL, NULL, NULL, NULL),
    ('julia-giromini-russia', 'Julia Giromini', 'russia', 15, 'Rus_Giromini', NULL, NULL, NULL, NULL),
    ('julia-russia', 'Julia', 'russia', 13, 'Rus_Jukyass', NULL, NULL, NULL, NULL),
    ('maria-julia-russia', 'Maria Júlia', 'russia', 14, 'Rus_Maju', NULL, NULL, NULL, NULL),
    ('eric-lima-tropa-dos-laranjas', 'Eric Lima', 'tropa-dos-laranjas', 15, 'Eric.szp', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('ester-piscioneri-tropa-dos-laranjas', 'Ester Piscioneri', 'tropa-dos-laranjas', 16, 'Piscioneri', 'FIRST_GENERATION', 'TII', 'LEADER', NULL),
    ('eros-olivatto-tropa-dos-laranjas', 'Eros Olivatto', 'tropa-dos-laranjas', 16, 'Olivatto', 'FIRST_GENERATION', 'TII', NULL, 'Atuou na formação da 2ª geração; sua geração de origem permanece a 1ª.'),
    ('ana-fargoni-tropa-dos-laranjas', 'Ana Fargoni', 'tropa-dos-laranjas', 16, 'Fargoni', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('lucas-lobo-tropa-dos-laranjas', 'Lucas Lobo', 'tropa-dos-laranjas', 17, 'Lobo', 'FIRST_GENERATION', 'AVI', NULL, 'Ex-TII; atualmente associado ao grupo AVI.'),
    ('sophia-alves-tropa-dos-laranjas', 'Sophia Alves', 'tropa-dos-laranjas', 15, 'Sophiazzy', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('paulo-zanetti-tropa-dos-laranjas', 'Paulo Zanetti', 'tropa-dos-laranjas', 16, 'Zanetti', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('nicolly-vitoria-tropa-dos-laranjas', 'Nicolly Vitoria', 'tropa-dos-laranjas', 15, '016Nick', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('victor-coelho-tropa-dos-laranjas', 'Victor Coelho', 'tropa-dos-laranjas', 16, 'Coelho', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('grazielly-cardoso-tropa-dos-laranjas', 'Grazielly Cardoso', 'tropa-dos-laranjas', 16, 'Tonelli', 'FIRST_GENERATION', 'TII', NULL, NULL),
    ('carlos-eduardo-tropa-dos-laranjas', 'Carlos Eduardo', 'tropa-dos-laranjas', 15, 'Caduh', 'FIRST_GENERATION', 'AVI', NULL, NULL),
    ('ana-martins-tropa-dos-laranjas', 'Ana Martins', 'tropa-dos-laranjas', 16, 'AJ_Dercole', 'SECOND_GENERATION', 'AVI', 'LEADER', NULL),
    ('nyckollas-antonio-tropa-dos-laranjas', 'Nyckollas Antonio', 'tropa-dos-laranjas', 17, 'Nyckollas.vz', 'FIRST_GENERATION', 'AVI', NULL, NULL),
    ('ana-beatriz-tropa-dos-laranjas', 'Ana Beatriz', 'tropa-dos-laranjas', 16, 'Ana.zxd', 'FIRST_GENERATION', 'AVI', NULL, NULL),
    ('gustavo-martins-tropa-dos-laranjas', 'Gustavo Martins', 'tropa-dos-laranjas', 16, 'GM_Dercole', 'FIRST_GENERATION', 'AVI', 'VICE_LEADER', NULL),
    ('emanuelly-barbosa-tropa-dos-laranjas', 'Emanuelly Barbosa', 'tropa-dos-laranjas', 16, 'M.barbosaaz', 'FIRST_GENERATION', 'AVI', NULL, NULL),
    ('ryan-amaral-tropa-dos-laranjas', 'Ryan Amaral', 'tropa-dos-laranjas', 15, '_amaral.ryan', 'FIRST_GENERATION', 'AVI', NULL, NULL),
    ('gabriel-menezes-tropa-dos-laranjas', 'Gabriel Menezes', 'tropa-dos-laranjas', 16, 'grmenezess', 'FIRST_GENERATION', 'AVI', NULL, NULL),
    ('rhaiany-tropa-dos-laranjas', 'Rhaiany', 'tropa-dos-laranjas', 16, 'Rhay.opx', 'SECOND_GENERATION', 'AVI', NULL, NULL),
    ('emiliano-amani-tropa-dos-laranjas', 'Emiliano Amani', 'tropa-dos-laranjas', 15, 'Emi.Amani', 'SECOND_GENERATION', 'TII', NULL, NULL),
    ('ana-clara-tropa-dos-laranjas', 'Ana Clara', 'tropa-dos-laranjas', 15, 'Godlessyz', 'SECOND_GENERATION', 'AVI', NULL, NULL),
    ('sofia-tropa-dos-laranjas', 'Sofia', 'tropa-dos-laranjas', 15, 'iiysofia', 'SECOND_GENERATION', 'TII', NULL, NULL),
    ('otavio-macoppi-tropa-dos-laranjas', 'Otávio Macoppi', 'tropa-dos-laranjas', 15, 'Macoppi', 'SECOND_GENERATION', 'TII', NULL, NULL),
    ('eloa-cristine-tropa-dos-laranjas', 'Eloá Cristine', 'tropa-dos-laranjas', 15, 'Loá', 'SECOND_GENERATION', 'AVI', NULL, NULL)
;
INSERT INTO athletes (display_name, slug, origin, age_at_reference, age_reference_date, nationality, birth_date, bio) SELECT display_name, slug, 'FICTIONAL', age_at_reference, DATE '2026-10-08', NULL, NULL, bio FROM seed_athletes ON CONFLICT (slug) DO UPDATE SET display_name = EXCLUDED.display_name, origin = 'FICTIONAL', age_at_reference = EXCLUDED.age_at_reference, age_reference_date = EXCLUDED.age_reference_date, bio = EXCLUDED.bio, updated_at = CURRENT_TIMESTAMP;

INSERT INTO athlete_teams (athlete_id, team_id, sport_id, status, generation, group_name, leadership_role) SELECT a.id, t.id, NULL, 'ACTIVE', sa.generation, sa.group_name, sa.leadership_role FROM seed_athletes sa JOIN athletes a ON a.slug = sa.slug JOIN teams t ON t.slug = sa.team_slug WHERE NOT EXISTS (SELECT 1 FROM athlete_teams at WHERE at.athlete_id = a.id AND at.team_id = t.id AND at.sport_id IS NULL);
UPDATE athlete_teams at SET generation = sa.generation, group_name = sa.group_name, leadership_role = sa.leadership_role, updated_at = CURRENT_TIMESTAMP FROM seed_athletes sa JOIN athletes a ON a.slug = sa.slug JOIN teams t ON t.slug = sa.team_slug WHERE at.athlete_id = a.id AND at.team_id = t.id AND at.sport_id IS NULL;

INSERT INTO athlete_game_accounts (athlete_team_id, game_id, username, display_name) SELECT at.id, NULL, sa.gamer_username, sa.gamer_username FROM seed_athletes sa JOIN athletes a ON a.slug = sa.slug JOIN teams t ON t.slug = sa.team_slug JOIN athlete_teams at ON at.athlete_id = a.id AND at.team_id = t.id AND at.sport_id IS NULL WHERE sa.gamer_username IS NOT NULL AND NOT EXISTS (SELECT 1 FROM athlete_game_accounts aga WHERE aga.athlete_team_id = at.id AND aga.game_id IS NULL AND LOWER(aga.username) = LOWER(sa.gamer_username));

INSERT INTO championships (name, short_name, slug, description, championship_type, competition_level_id, is_fictional) SELECT v.name, v.short_name, v.slug, v.description, v.championship_type, cl.id, v.is_fictional FROM (VALUES ('AGON','AGON','agon-cup','Competição central do Universo AGON.','MULTI_SPORT',TRUE,'agon'), ('Estadual Universitário','Estadual','estadual-universitario','Registro-modelo para o nível estadual; regras específicas a definir.','MULTI_SPORT',FALSE,'estadual'), ('Nacional Universitário NDU','Nacional NDU','nacional-ndu','Registro-modelo para competições nacionais associadas à NDU.','MULTI_SPORT',FALSE,'nacional'), ('Jogos Universitários Brasileiros (JUBs)','JUBs','jubs','Campeonato nacional dos Jogos Universitários Brasileiros.','MULTI_SPORT',FALSE,'nacional'), ('Mundial Universitário','Mundial','mundial-universitario','Registro-modelo para o nível mundial universitário.','MULTI_SPORT',FALSE,'mundial')) AS v(name, short_name, slug, description, championship_type, is_fictional, level_slug) JOIN competition_levels cl ON cl.slug = v.level_slug WHERE NOT EXISTS (SELECT 1 FROM championships c WHERE c.slug = v.slug);

INSERT INTO championship_organizations (championship_id, organization_id, role) SELECT c.id, o.id, v.role FROM (VALUES ('agon-cup','universo-agon','ORGANIZER'), ('estadual-universitario','fupe','ORGANIZER'), ('nacional-ndu','ndu','ORGANIZER'), ('jubs','cbdu','ORGANIZER'), ('mundial-universitario','fisu','ORGANIZER')) AS v(championship_slug, organization_slug, role) JOIN championships c ON c.slug = v.championship_slug JOIN organizations o ON o.slug = v.organization_slug WHERE NOT EXISTS (SELECT 1 FROM championship_organizations co WHERE co.championship_id = c.id AND co.organization_id = o.id);

INSERT INTO championship_editions (championship_id, name, year, edition_number, status, description) SELECT c.id, v.edition_name, 2026, 1, 'PLANNED', v.description FROM (VALUES ('agon-cup','AGON 2026','Edição demonstrativa; não representa resultados canônicos.'), ('estadual-universitario','Estadual Universitário 2026','Edição-modelo; calendário e regulamento a confirmar.'), ('nacional-ndu','Nacional Universitário NDU 2026','Edição-modelo; calendário e regulamento a confirmar.'), ('jubs','JUBs 2026','Edição-modelo; calendário e regulamento a confirmar.'), ('mundial-universitario','Mundial Universitário 2026','Edição-modelo; calendário e regulamento a confirmar.')) AS v(championship_slug, edition_name, description) JOIN championships c ON c.slug = v.championship_slug WHERE NOT EXISTS (SELECT 1 FROM championship_editions ce WHERE ce.championship_id = c.id AND ce.year = 2026 AND ce.name = v.edition_name);

INSERT INTO edition_competitions (edition_id, sport_id, category_id, game_id, name, slug, tournament_format, status, description) SELECT ce.id, s.id, cat.id, g.id, v.name, v.slug, v.tournament_format, 'PLANNED', v.description FROM (VALUES ('agon-cup','futebol','masculino',NULL,'Futebol Masculino - AGON 2026','agon-2026-futebol-masculino','LEAGUE','Competição demonstrativa; formato final a confirmar.'), ('agon-cup','voleibol','feminino',NULL,'Voleibol Feminino - AGON 2026','agon-2026-voleibol-feminino','LEAGUE','Competição demonstrativa; formato final a confirmar.'), ('agon-cup','xadrez','absoluto',NULL,'Xadrez Absoluto - AGON 2026','agon-2026-xadrez-absoluto','SWISS','Competição demonstrativa; formato final a confirmar.'), ('agon-cup','jogos-eletronicos','misto','valorant','Valorant Misto - AGON 2026','agon-2026-valorant-misto','GROUPS_PLAYOFFS','Competição demonstrativa; formato final a confirmar.'), ('estadual-universitario','futebol','masculino',NULL,'Futebol Masculino - Estadual 2026','estadual-2026-futebol-masculino','LEAGUE','Registro de exemplo; regulamento canônico a confirmar.'), ('nacional-ndu','futebol','masculino',NULL,'Futebol Masculino - Nacional NDU 2026','nacional-ndu-2026-futebol-masculino','LEAGUE','Registro de exemplo; regulamento canônico a confirmar.'), ('jubs','atletismo','masculino',NULL,'Atletismo Masculino - JUBs 2026','jubs-2026-atletismo-masculino','EVENTS','Registro de exemplo; regulamento canônico a confirmar.'), ('mundial-universitario','futebol','masculino',NULL,'Futebol Masculino - Mundial 2026','mundial-2026-futebol-masculino','LEAGUE','Registro de exemplo; regulamento canônico a confirmar.')) AS v(championship_slug, sport_slug, category_slug, game_slug, name, slug, tournament_format, description) JOIN championships c ON c.slug = v.championship_slug JOIN championship_editions ce ON ce.championship_id = c.id AND ce.year = 2026 JOIN sports s ON s.slug = v.sport_slug LEFT JOIN categories cat ON cat.slug = v.category_slug LEFT JOIN games g ON g.slug = v.game_slug WHERE NOT EXISTS (SELECT 1 FROM edition_competitions ec WHERE ec.slug = v.slug);

INSERT INTO qualification_methods (name, slug, description) VALUES
    ('Campeão','champion','Classificação por título de campeão.'),
    ('Posicionamento','top-placement','Classificação conforme posição final.'),
    ('Ranking','ranking','Classificação por ranking.'),
    ('Convite','invitation','Classificação por convite.'),
    ('Seletiva','qualifier','Classificação por seletiva.'),
    ('Outro / a definir','other','Método que ainda será especificado no regulamento.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO qualification_rules (source_competition_id, target_competition_id, method_id, position_from, position_to, description) SELECT src.id, dst.id, qm.id, v.position_from, v.position_to, v.description FROM (VALUES ('estadual-2026-futebol-masculino','nacional-ndu-2026-futebol-masculino','champion',1,1,'Exemplo técnico: campeão estadual poderia avançar; confirmar regulamento.'), ('nacional-ndu-2026-futebol-masculino','mundial-2026-futebol-masculino','top-placement',1,1,'Exemplo técnico: classificado nacional poderia avançar; confirmar regulamento.')) AS v(source_slug, target_slug, method_slug, position_from, position_to, description) JOIN edition_competitions src ON src.slug = v.source_slug JOIN edition_competitions dst ON dst.slug = v.target_slug JOIN qualification_methods qm ON qm.slug = v.method_slug WHERE NOT EXISTS (SELECT 1 FROM qualification_rules qr WHERE qr.source_competition_id = src.id AND qr.target_competition_id = dst.id AND qr.method_id = qm.id);

INSERT INTO competition_participants (competition_id, participant_type, team_id, status) SELECT ec.id, 'TEAM', t.id, 'ACTIVE' FROM (VALUES ('agon-2026-futebol-masculino','turquia'),('agon-2026-futebol-masculino','franca'),('agon-2026-futebol-masculino','holanda'),('agon-2026-futebol-masculino','grota'), ('agon-2026-voleibol-feminino','turquia'),('agon-2026-voleibol-feminino','russia'),('agon-2026-voleibol-feminino','holanda'), ('agon-2026-valorant-misto','tropa-dos-laranjas'),('agon-2026-valorant-misto','turquia'), ('estadual-2026-futebol-masculino','caaso'),('estadual-2026-futebol-masculino','engenharia-mackenzie'), ('nacional-ndu-2026-futebol-masculino','caaso'),('nacional-ndu-2026-futebol-masculino','leu-unicamp'), ('mundial-2026-futebol-masculino','turquia'),('mundial-2026-futebol-masculino','franca')) AS v(competition_slug, team_slug) JOIN edition_competitions ec ON ec.slug = v.competition_slug JOIN teams t ON t.slug = v.team_slug WHERE NOT EXISTS (SELECT 1 FROM competition_participants cp WHERE cp.competition_id = ec.id AND cp.team_id = t.id AND cp.participant_type = 'TEAM');
INSERT INTO competition_participants (competition_id, participant_type, athlete_id, status) SELECT ec.id, 'ATHLETE', a.id, 'ACTIVE' FROM (VALUES ('agon-2026-xadrez-absoluto','levi-franca'), ('agon-2026-xadrez-absoluto','isabella-russia'), ('agon-2026-xadrez-absoluto','arianne-grota')) AS v(competition_slug, athlete_slug) JOIN edition_competitions ec ON ec.slug = v.competition_slug JOIN athletes a ON a.slug = v.athlete_slug WHERE NOT EXISTS (SELECT 1 FROM competition_participants cp WHERE cp.competition_id = ec.id AND cp.athlete_id = a.id AND cp.participant_type = 'ATHLETE');

INSERT INTO stages (competition_id, name, stage_type, sequence, start_date, end_date) SELECT ec.id, 'Fase de grupos (demo)', 'GROUP_STAGE', 1, NULL, NULL FROM edition_competitions ec WHERE ec.slug = 'agon-2026-futebol-masculino' AND NOT EXISTS (SELECT 1 FROM stages s WHERE s.competition_id = ec.id AND s.sequence = 1);
INSERT INTO stages (competition_id, name, stage_type, sequence) SELECT ec.id, 'Fase de classificação (demo)', 'QUALIFICATION', 1 FROM edition_competitions ec WHERE ec.slug = 'agon-2026-valorant-misto' AND NOT EXISTS (SELECT 1 FROM stages s WHERE s.competition_id = ec.id AND s.sequence = 1);
INSERT INTO competition_groups (stage_id, name, slug) SELECT s.id, 'Grupo A (demo)', 'grupo-a-demo' FROM stages s JOIN edition_competitions ec ON ec.id = s.competition_id WHERE ec.slug = 'agon-2026-futebol-masculino' AND NOT EXISTS (SELECT 1 FROM competition_groups g WHERE g.stage_id = s.id AND g.slug = 'grupo-a-demo');

INSERT INTO matches (competition_id, stage_id, group_id, round_name, match_number, scheduled_at, venue, status, notes) SELECT ec.id, s.id, g.id, 'Partida de demonstração', 1, TIMESTAMPTZ '2026-11-01 16:00:00-03', 'Local demonstrativo', 'SCHEDULED', 'Registro técnico para demonstrar o schema; não é calendário ou confronto canônico.' FROM edition_competitions ec LEFT JOIN stages s ON s.competition_id = ec.id AND s.sequence = 1 LEFT JOIN competition_groups g ON g.stage_id = s.id AND g.slug = 'grupo-a-demo' WHERE ec.slug = 'agon-2026-futebol-masculino' AND NOT EXISTS (SELECT 1 FROM matches m WHERE m.competition_id = ec.id AND m.match_number = 1 AND m.round_name = 'Partida de demonstração');
INSERT INTO match_participants (match_id, competition_participant_id, side, score, result) SELECT m.id, cp.id, v.side, NULL, 'PENDING' FROM matches m JOIN edition_competitions ec ON ec.id = m.competition_id JOIN (VALUES ('turquia','HOME'),('franca','AWAY')) AS v(team_slug, side) ON TRUE JOIN teams t ON t.slug = v.team_slug JOIN competition_participants cp ON cp.competition_id = ec.id AND cp.team_id = t.id AND cp.participant_type = 'TEAM' WHERE ec.slug = 'agon-2026-futebol-masculino' AND m.round_name = 'Partida de demonstração' ON CONFLICT (match_id, competition_participant_id) DO NOTHING;

INSERT INTO standings (competition_id, competition_participant_id, played, wins, draws, losses, points) SELECT ec.id, cp.id, 0, 0, 0, 0, 0 FROM edition_competitions ec JOIN competition_participants cp ON cp.competition_id = ec.id AND cp.participant_type = 'TEAM' WHERE ec.slug = 'agon-2026-futebol-masculino' ON CONFLICT (competition_id, competition_participant_id) DO NOTHING;

INSERT INTO match_events (match_id, event_type, description) SELECT m.id, 'NOTE', 'Evento de demonstração; sem resultado ou estatística oficial.' FROM matches m JOIN edition_competitions ec ON ec.id = m.competition_id WHERE ec.slug = 'agon-2026-futebol-masculino' AND m.round_name = 'Partida de demonstração' AND NOT EXISTS (SELECT 1 FROM match_events me WHERE me.match_id = m.id AND me.event_type = 'NOTE');

INSERT INTO calendar_events (title, description, event_type, starts_at, ends_at, location, championship_edition_id, competition_id, match_id, created_by) SELECT 'Evento demonstrativo do AGON Hub', 'Registro técnico para testar a agenda. Substituir por calendário canônico.', 'DEMO', TIMESTAMPTZ '2026-11-01 16:00:00-03', NULL, 'Local demonstrativo', ce.id, ec.id, m.id, u.id FROM edition_competitions ec JOIN championship_editions ce ON ce.id = ec.edition_id JOIN championships c ON c.id = ce.championship_id JOIN matches m ON m.competition_id = ec.id AND m.round_name = 'Partida de demonstração' JOIN users u ON u.username = 'agon.admin' WHERE ec.slug = 'agon-2026-futebol-masculino' AND NOT EXISTS (SELECT 1 FROM calendar_events ev WHERE ev.title = 'Evento demonstrativo do AGON Hub');

INSERT INTO titles (name, title_type, description, championship_id, sport_id, category_id) SELECT 'Título demonstrativo (não canônico)', 'DEMO', 'Registro de teste para demonstrar a relação equipe-título; não é uma conquista oficial do Universo AGON.', c.id, s.id, cat.id FROM championships c JOIN sports s ON s.slug = 'futebol' JOIN categories cat ON cat.slug = 'masculino' WHERE c.slug = 'agon-cup' AND NOT EXISTS (SELECT 1 FROM titles t WHERE t.name = 'Título demonstrativo (não canônico)');
INSERT INTO team_titles (team_id, title_id, championship_edition_id, won_at) SELECT tm.id, ti.id, ce.id, NULL FROM teams tm JOIN titles ti ON ti.name = 'Título demonstrativo (não canônico)' JOIN championships c ON c.slug = 'agon-cup' JOIN championship_editions ce ON ce.championship_id = c.id AND ce.year = 2026 WHERE tm.slug = 'turquia' AND NOT EXISTS (SELECT 1 FROM team_titles tt WHERE tt.team_id = tm.id AND tt.title_id = ti.id AND tt.championship_edition_id = ce.id);

INSERT INTO news (title, slug, subtitle, content, cover_image, author_id, status, published_at) SELECT 'Bem-vindo ao AGON Hub - conteúdo demonstrativo', 'bem-vindo-agon-hub-demo', 'Primeiro conteúdo de exemplo da plataforma.', 'Este é um texto de demonstração para validar notícias e relacionamentos. Não representa notícia canônica do Universo AGON.', '/uploads/news/agon-hub-demo.jpg', u.id, 'PUBLISHED', CURRENT_TIMESTAMP FROM users u WHERE u.username = 'agon.admin' ON CONFLICT (slug) DO NOTHING;
INSERT INTO news_teams (news_id, team_id) SELECT n.id, t.id FROM news n JOIN teams t ON t.slug = 'turquia' WHERE n.slug = 'bem-vindo-agon-hub-demo' ON CONFLICT (news_id, team_id) DO NOTHING;
INSERT INTO news_championships (news_id, championship_id) SELECT n.id, c.id FROM news n JOIN championships c ON c.slug = 'agon-cup' WHERE n.slug = 'bem-vindo-agon-hub-demo' ON CONFLICT (news_id, championship_id) DO NOTHING;
INSERT INTO news_matches (news_id, match_id) SELECT n.id, m.id FROM news n JOIN edition_competitions ec ON ec.slug = 'agon-2026-futebol-masculino' JOIN matches m ON m.competition_id = ec.id AND m.round_name = 'Partida de demonstração' WHERE n.slug = 'bem-vindo-agon-hub-demo' ON CONFLICT (news_id, match_id) DO NOTHING;

INSERT INTO newspapers (title, edition, description, cover_image, file_url, published_at, created_by) SELECT 'Jornal AGON - edição demonstrativa', 'DEMO-001', 'Registro inicial de teste. Substituir por uma edição editorial real do Universo AGON.', '/uploads/newspapers/jornal-agon-demo.jpg', '/uploads/newspapers/jornal-agon-demo.pdf', CURRENT_TIMESTAMP, u.id FROM users u WHERE u.username = 'agon.admin' AND NOT EXISTS (SELECT 1 FROM newspapers n WHERE n.edition = 'DEMO-001');

INSERT INTO highlights (title, description, media_url, thumbnail_url, match_id, created_by) SELECT 'Highlight demonstrativo', 'Arquivo de exemplo; nenhum vídeo real foi fornecido.', '/uploads/highlights/demo.mp4', '/uploads/highlights/demo-thumbnail.jpg', m.id, u.id FROM users u JOIN edition_competitions ec ON ec.slug = 'agon-2026-futebol-masculino' JOIN matches m ON m.competition_id = ec.id AND m.round_name = 'Partida de demonstração' WHERE u.username = 'agon.admin' AND NOT EXISTS (SELECT 1 FROM highlights h WHERE h.title = 'Highlight demonstrativo');

INSERT INTO comments (user_id, news_id, content) SELECT u.id, n.id, 'Comentário demonstrativo para testar as interações do AGON Hub.' FROM users u CROSS JOIN news n WHERE u.username = 'agon.demo' AND n.slug = 'bem-vindo-agon-hub-demo' AND NOT EXISTS (SELECT 1 FROM comments c WHERE c.user_id = u.id AND c.news_id = n.id);

INSERT INTO reactions (user_id, news_id, reaction_type) SELECT u.id, n.id, 'LIKE' FROM users u CROSS JOIN news n WHERE u.username = 'agon.demo' AND n.slug = 'bem-vindo-agon-hub-demo' ON CONFLICT (user_id, news_id) DO NOTHING;

INSERT INTO follows (user_id, team_id) SELECT u.id, t.id FROM users u JOIN teams t ON t.slug = 'turquia' WHERE u.username = 'agon.demo' ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO media (uploaded_by, file_name, file_path, mime_type, file_size, entity_type, entity_id) SELECT u.id, 'demo-placeholder.txt', '/uploads/demo/demo-placeholder.txt', 'text/plain', 0, 'NEWS', n.id FROM users u JOIN news n ON n.slug = 'bem-vindo-agon-hub-demo' WHERE u.username = 'agon.admin' AND NOT EXISTS (SELECT 1 FROM media m WHERE m.file_path = '/uploads/demo/demo-placeholder.txt');
COMMIT;