const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Autenticação necessária. Informe um token Bearer."
        });
    }

    const token = cabecalho.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            error: "Token de autenticação não informado."
        });
    }

    const segredo = process.env.JWT_SECRET;

    if (typeof segredo !== "string" || segredo.length < 32) {
        return res.status(500).json({
            error: "A configuração JWT_SECRET está ausente ou é inválida."
        });
    }

    try {
        const dadosToken = jwt.verify(token, segredo, {
            algorithms: ["HS256"]
        });

        if (
            !dadosToken.id ||
            !dadosToken.username ||
            !dadosToken.role
        ) {
            return res.status(401).json({
                error: "O token não contém os dados necessários."
            });
        }

        req.usuario = {
            id: dadosToken.id,
            username: dadosToken.username,
            role: dadosToken.role
        };

        return next();
    } catch (erro) {
        if (erro.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "O token expirou. Faça login novamente."
            });
        }

        return res.status(401).json({
            error: "Token inválido."
        });
    }
}

function exigirPapel(...papeisPermitidos) {
    return function (req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                error: "Autenticação necessária."
            });
        }

        const papelUsuario = String(req.usuario.role).toLowerCase();
        const papeis = papeisPermitidos.map(
            (papel) => papel.toLowerCase()
        );

        if (!papeis.includes(papelUsuario)) {
            return res.status(403).json({
                error: "Você não tem permissão para executar esta operação."
            });
        }

        return next();
    };
}

module.exports = {
    autenticarToken,
    exigirPapel
};