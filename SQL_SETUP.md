# AGON Hub — arquivos SQL

## Arquivos
- `schema.sql`: cria as tabelas e restrições. Execute uma vez em um banco vazio.
- `seed.sql`: insere registros de demonstração para as tabelas. Pode ser reexecutado para complementar/atualizar os dados iniciais.

## Ordem de execução
1. Criar um banco vazio chamado `agon_hub`.
2. Executar `schema.sql`.
3. Executar `seed.sql`.

**Avisos:** os eventos, partidas e títulos marcados como DEMO são registros técnicos, não fatos canônicos do Universo AGON. Os handles foram carregados sem game associado porque a lista não especifica qual jogo corresponde a cada username. As contas `agon.admin` e `agon.demo` têm a senha de desenvolvimento `password`; altere/remova essas credenciais antes de qualquer publicação.
