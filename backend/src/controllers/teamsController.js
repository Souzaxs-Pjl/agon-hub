const banco = require("../database/connection");

const CAMPOS_EQUIPE = `
    id, name, short_name, slug, description, logo_url,
    team_type, is_fictional, institution_id, city, state,
    country, founded_at, created_at, updated_at
`;

function obterIdValido(valor) {
    const texto = String(valor);

    if (!/^[1-9]\d*$/.test(texto)) {
        return null;
    }

    const id = Number(texto);

    return Number.isSafeInteger(id) ? id : null;
}

function gerarSlug(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 180);
}

function textoObrigatorio(valor, campo) {
    if (typeof valor !== "string" || !valor.trim()) {
        throw new Error(`${campo} é obrigatório e deve ser um texto.`);
    }

    return valor.trim();
}

function textoOpcional(valor, campo) {
    if (valor === undefined || valor === null) {
        return null;
    }

    if (typeof valor !== "string") {
        throw new Error(`${campo} deve ser um texto ou nulo.`);
    }

    return valor.trim() || null;
}

function normalizarInstituicaoId(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    const texto = String(valor);

    if (!/^[1-9]\d*$/.test(texto)) {
        throw new Error("institution_id deve ser um ID inteiro positivo ou nulo.");
    }

    return texto;
}

function normalizarData(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    if (
        typeof valor !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        throw new Error("founded_at deve estar no formato AAAA-MM-DD ou ser nulo.");
    }

    return valor;
}

function responderErroBanco(res, erro) {
    console.error("Erro no PostgreSQL:", erro.message);

    if (erro.code === "23505") {
        return res.status(409).json({
            error: "Já existe uma equipe cadastrada com esse slug."
        });
    }

    if (erro.code === "23503") {
        return res.status(400).json({
            error: "A instituição informada não existe ou possui uma referência inválida."
        });
    }

    if (
        ["22001", "22007", "22008", "22P02", "23502", "23514"].includes(
            erro.code
        )
    ) {
        return res.status(400).json({
            error: "Os dados informados são inválidos para o banco de dados."
        });
    }

    return res.status(500).json({
        error: "Erro interno ao acessar as equipes."
    });
}

async function getTeams(req, res) {
    try {
        const resultado = await banco.consultar(
            `SELECT ${CAMPOS_EQUIPE} FROM teams ORDER BY id ASC`
        );

        return res.status(200).json(resultado.rows);
    } catch (erro) {
        return responderErroBanco(res, erro);
    }
}

async function getTeamById(req, res) {
    const id = obterIdValido(req.params.id);

    if (id === null) {
        return res.status(400).json({
            error: "O ID da equipe deve ser um inteiro positivo."
        });
    }

    try {
        const resultado = await banco.consultar(
            `SELECT ${CAMPOS_EQUIPE} FROM teams WHERE id = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Equipe não encontrada."
            });
        }

        return res.status(200).json(resultado.rows[0]);
    } catch (erro) {
        return responderErroBanco(res, erro);
    }
}

async function createTeam(req, res) {
    const dados = req.body || {};

    try {
        const nome = textoObrigatorio(dados.name, "name");

        const slug = dados.slug
            ? textoObrigatorio(dados.slug, "slug")
            : gerarSlug(nome);

        if (!slug) {
            throw new Error("Não foi possível gerar um slug válido para a equipe.");
        }

        const tipoRecebido =
            dados.team_type ??
            dados.type ??
            (dados.is_fictional === true ? "FICTIONAL" : "OTHER");

        const tipo = textoObrigatorio(tipoRecebido, "team_type").toUpperCase();

        let ficticia;

        if (dados.is_fictional === undefined) {
            ficticia = tipo === "FICTIONAL";
        } else if (typeof dados.is_fictional === "boolean") {
            ficticia = dados.is_fictional;
        } else {
            throw new Error("is_fictional deve ser verdadeiro ou falso.");
        }

        const instituicaoId = normalizarInstituicaoId(
            dados.institution_id
        );

        const pais = dados.country === undefined
            ? "Brasil"
            : textoObrigatorio(dados.country, "country");

        const parametros = [
            nome,
            textoOpcional(dados.short_name, "short_name"),
            slug,
            textoOpcional(dados.description, "description"),
            textoOpcional(dados.logo_url, "logo_url"),
            tipo,
            ficticia,
            instituicaoId,
            textoOpcional(dados.city, "city"),
            textoOpcional(dados.state, "state"),
            pais,
            normalizarData(dados.founded_at)
        ];

        const resultado = await banco.consultar(
            `INSERT INTO teams (
                name, short_name, slug, description, logo_url,
                team_type, is_fictional, institution_id,
                city, state, country, founded_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            RETURNING ${CAMPOS_EQUIPE}`,
            parametros
        );

        return res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        if (erro instanceof Error && !erro.code) {
            return res.status(400).json({
                error: erro.message
            });
        }

        return responderErroBanco(res, erro);
    }
}

async function updateTeam(req, res) {
    const id = obterIdValido(req.params.id);

    if (id === null) {
        return res.status(400).json({
            error: "O ID da equipe deve ser um inteiro positivo."
        });
    }

    const dadosRecebidos = req.body || {};
    const dados = { ...dadosRecebidos };

    if (dados.team_type === undefined && dados.type !== undefined) {
        dados.team_type = dados.type;
    }

    const camposPermitidos = [
        { campo: "name", tipo: "obrigatorio" },
        { campo: "short_name", tipo: "opcional" },
        { campo: "slug", tipo: "obrigatorio" },
        { campo: "description", tipo: "opcional" },
        { campo: "logo_url", tipo: "opcional" },
        { campo: "team_type", tipo: "tipo" },
        { campo: "is_fictional", tipo: "booleano" },
        { campo: "institution_id", tipo: "instituicao" },
        { campo: "city", tipo: "opcional" },
        { campo: "state", tipo: "opcional" },
        { campo: "country", tipo: "obrigatorio" },
        { campo: "founded_at", tipo: "data" }
    ];

    const atualizacoes = [];
    const parametros = [];

    try {
        for (const definicao of camposPermitidos) {
            const campo = definicao.campo;

            if (!Object.prototype.hasOwnProperty.call(dados, campo)) {
                continue;
            }

            let valor = dados[campo];

            switch (definicao.tipo) {
                case "obrigatorio":
                    valor = textoObrigatorio(valor, campo);
                    break;

                case "opcional":
                    valor = textoOpcional(valor, campo);
                    break;

                case "tipo":
                    valor = textoObrigatorio(valor, campo).toUpperCase();
                    break;

                case "booleano":
                    if (typeof valor !== "boolean") {
                        throw new Error("is_fictional deve ser verdadeiro ou falso.");
                    }
                    break;

                case "instituicao":
                    valor = normalizarInstituicaoId(valor);
                    break;

                case "data":
                    valor = normalizarData(valor);
                    break;
            }

            parametros.push(valor);
            atualizacoes.push(`${campo} = $${parametros.length}`);
        }

        if (atualizacoes.length === 0) {
            return res.status(400).json({
                error: "Informe pelo menos um campo válido para atualizar."
            });
        }

        parametros.push(id);

        const resultado = await banco.consultar(
            `UPDATE teams
             SET ${atualizacoes.join(", ")},
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $${parametros.length}
             RETURNING ${CAMPOS_EQUIPE}`,
            parametros
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Equipe não encontrada."
            });
        }

        return res.status(200).json(resultado.rows[0]);
    } catch (erro) {
        if (erro instanceof Error && !erro.code) {
            return res.status(400).json({
                error: erro.message
            });
        }

        return responderErroBanco(res, erro);
    }
}

async function deleteTeam(req, res) {
    const id = obterIdValido(req.params.id);

    if (id === null) {
        return res.status(400).json({
            error: "O ID da equipe deve ser um inteiro positivo."
        });
    }

    try {
        const resultado = await banco.consultar(
            `DELETE FROM teams
             WHERE id = $1
             RETURNING ${CAMPOS_EQUIPE}`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Equipe não encontrada."
            });
        }

        return res.status(200).json({
            message: "Equipe excluída com sucesso.",
            team: resultado.rows[0]
        });
    } catch (erro) {
        return responderErroBanco(res, erro);
    }
}

module.exports = {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
};
