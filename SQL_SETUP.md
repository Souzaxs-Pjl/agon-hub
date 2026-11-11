# AGON Hub 2.0 — Inicialização do PostgreSQL

O modelo desta versão utiliza 10 tabelas e uma view de classificação derivada das partidas.

## Importante
O arquivo schema.sql deve ser executado em um banco PostgreSQL novo e vazio. Ele substitui conceitualmente o schema legado de 39 tabelas; não execute os dois no mesmo banco.

## Ordem de execução
1. Crie o banco agon_hub no PostgreSQL.
2. Execute backend/database/schema.sql.
3. Execute backend/database/seed.sql.
4. Configure o backend em backend/.env.
5. Crie o primeiro administrador com npm run admin:create.

## Classificações
A view competition_standings calcula partidas, vitórias, empates, derrotas, gols/pontos marcados e sofridos, saldo e pontos. O cálculo considera apenas partidas com status COMPLETED. Partidas agendadas, adiadas ou canceladas não alteram a classificação.

O critério inicial de desempate é: pontos, vitórias, saldo, gols marcados e nome do participante. Critérios específicos de modalidades ou regulamentos poderão ser adicionados sem duplicar a tabela de classificação.

## Dados de demonstração
Os registros relacionados à Liga de Demonstração AGON estão marcados com is_demo = TRUE. Eles servem para testar a integração e não devem ser tratados como resultados canônicos.

O seed pode ser reexecutado e utiliza chaves únicas e verificações de existência para evitar duplicação dos registros demonstrativos.
