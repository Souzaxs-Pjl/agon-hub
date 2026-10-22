const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const banco = require("../database/connection");

const DURACAO_TOKEN = "2h";

function segredoJwtConfigurado() {
    return (
        typeof process.env.JWT_SECRET === "string" &&
        process.env.JWT_SECRET.length >= 32
    );
}

function obterDadosPublicos(usuario) {
    return {
        id: usuario.id,
        name: usuario.name,
        username: usuario.username,
        email: usuario.email,
        profile_image: usuario.profile_image,
        bio: usuario.bio,
        role: usuario.role,
        created_at: usuario.created_at
    };
}

function responderErroBanco(res, erro) {
    console.error("Erro no banco durante a autenticação:", erro.message);

    if (erro.code === "23505") {
        return res.status(409).json({
            error: "Já existe um usuário com esse nome de usuário ou e-mail."
        });
    }

    return res.status(500).json({
        error: "Ocorreu um erro interno ao processar a solicitação."
    });
}

async function registrar(req, res) {
    const dados = req.body || {};

    const nome = dados.name;
    const nomeUsuario = dados.username;
    const emailRecebido = dados.email;
    const senha = dados.password;

    if (
        typeof nome !== "string" ||
        typeof nomeUsuario !== "string" ||
        typeof emailRecebido !== "string" ||
        typeof senha !== "string"
    ) {
        return res.status(400).json({
            error: "Informe name, username, email e password."
        });
    }

    const nomeNormalizado = nome.trim();
    const usuarioNormalizado = nomeUsuario.trim();
    const email = emailRecebido.trim().toLowerCase();

    if (!nomeNormalizado || nomeNormalizado.length > 120) {
        return res.status(400).json({
            error: "O nome é obrigatório e deve ter no máximo 120 caracteres."
        });
    }

    if (
        !/^[A-Za-z0-9._-]{3,50}$/.test(usuarioNormalizado)
    ) {
        return res.status(400).json({
            error: "O username deve ter de 3 a 50 caracteres: letras, números, ponto, hífen ou sublinhado."
        });
    }

    if (
        email.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return res.status(400).json({
            error: "Informe um endereço de e-mail válido."
        });
    }

    if (senha.length < 8) {
        return res.status(400).json({
            error: "A senha deve possuir pelo menos 8 caracteres."
        });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 12);

        const resultado = await banco.consultar(
            `INSERT INTO users (
                name,
                username,
                email,
                password_hash,
                role_id
            )
            SELECT $1, $2, $3, $4, id
            FROM roles
            WHERE name = 'user'
            RETURNING
                id, name, username, email,
                profile_image, bio, created_at`,
            [
                nomeNormalizado,
                usuarioNormalizado,
                email,
                senhaHash
            ]
        );

        if (resultado.rows.length === 0) {
            console.error(
                "Cadastro cancelado: o papel 'user' não existe na tabela roles."
            );

            return res.status(500).json({
                error: "O cadastro não pôde ser concluído. Verifique a configuração dos perfis."
            });
        }

        return res.status(201).json({
            message: "Usuário cadastrado com sucesso.",
            usuario: resultado.rows[0]
        });
    } catch (erro) {
        return responderErroBanco(res, erro);
    }
}

async function entrar(req, res) {
    if (!segredoJwtConfigurado()) {
        return res.status(500).json({
            error: "JWT_SECRET não foi configurado ou possui menos de 32 caracteres."
        });
    }

    const dados = req.body || {};

    const identificador = (
        dados.login ??
        dados.username ??
        dados.email ??
        ""
    );

    const senha = dados.password;

    if (
        typeof identificador !== "string" ||
        !identificador.trim() ||
        typeof senha !== "string" ||
        !senha
    ) {
        return res.status(400).json({
            error: "Informe login e password."
        });
    }

    try {
        const resultado = await banco.consultar(
            `SELECT
                u.id,
                u.name,
                u.username,
                u.email,
                u.password_hash,
                u.profile_image,
                u.bio,
                u.created_at,
                r.name AS role
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE LOWER(u.username) = LOWER($1)
               OR LOWER(u.email) = LOWER($1)
            LIMIT 1`,
            [identificador.trim()]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                error: "Credenciais inválidas."
            });
        }

        const usuario = resultado.rows[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.password_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                error: "Credenciais inválidas."
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                username: usuario.username,
                role: usuario.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: DURACAO_TOKEN
            }
        );

        return res.status(200).json({
            message: "Login realizado com sucesso.",
            token,
            token_type: "Bearer",
            expires_in: 7200,
            usuario: obterDadosPublicos(usuario)
        });
    } catch (erro) {
        return responderErroBanco(res, erro);
    }
}

async function obterPerfil(req, res) {
    try {
        const resultado = await banco.consultar(
            `SELECT
                u.id,
                u.name,
                u.username,
                u.email,
                u.profile_image,
                u.bio,
                u.created_at,
                r.name AS role
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE u.id = $1`,
            [req.usuario.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Usuário não encontrado."
            });
        }

        return res.status(200).json({
            usuario: resultado.rows[0]
        });
    } catch (erro) {
        return responderErroBanco(res, erro);
    }
}

module.exports = {
    registrar,
    entrar,
    obterPerfil
};
