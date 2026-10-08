let teams = [
    {
        id: 1,
        name: "Turquia",
        short_name: "TUR",
        type: "FICTIONAL"
    },
    {
        id: 2,
        name: "Rússia",
        short_name: "RUS",
        type: "FICTIONAL"
    },
    {
        id: 3,
        name: "Holanda",
        short_name: "HOL",
        type: "FICTIONAL"
    },
    {
        id: 4,
        name: "França",
        short_name: "FRA",
        type: "FICTIONAL"
    },
    {
        id: 5,
        name: "Grota",
        short_name: "GRO",
        type: "FICTIONAL"
    },
    {
        id: 6,
        name: "Tropa dos Laranjas",
        short_name: "N$",
        type: "FICTIONAL"
    }
];

function getTeams(req, res) {
    res.status(200).json(teams);
}

function getTeamById(req, res) {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: "ID inválido"
        });
    }

    const team = teams.find((team) => team.id === id);

    if (!team) {
        return res.status(404).json({
            error: "Equipe não encontrada"
        });
    }

    res.status(200).json(team);
}

function createTeam(req, res) {
    const { name, short_name, type } = req.body;

    if (!name || !short_name || !type) {
        return res.status(400).json({
            error: "name, short_name e type são obrigatórios"
        });
    }

    const newTeam = {
        id: teams.length > 0
            ? Math.max(...teams.map((team) => team.id)) + 1
            : 1,
        name,
        short_name,
        type
    };

    teams.push(newTeam);

    res.status(201).json(newTeam);
}

function updateTeam(req, res) {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: "ID inválido"
        });
    }

    const teamIndex = teams.findIndex((team) => team.id === id);

    if (teamIndex === -1) {
        return res.status(404).json({
            error: "Equipe não encontrada"
        });
    }

    const { name, short_name, type } = req.body;

    if (!name || !short_name || !type) {
        return res.status(400).json({
            error: "name, short_name e type são obrigatórios"
        });
    }

    teams[teamIndex] = {
        id,
        name,
        short_name,
        type
    };

    res.status(200).json(teams[teamIndex]);
}

function deleteTeam(req, res) {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: "ID inválido"
        });
    }

    const teamIndex = teams.findIndex((team) => team.id === id);

    if (teamIndex === -1) {
        return res.status(404).json({
            error: "Equipe não encontrada"
        });
    }

    const deletedTeam = teams.splice(teamIndex, 1);

    res.status(200).json({
        message: "Equipe excluída com sucesso",
        team: deletedTeam[0]
    });
}

module.exports = {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
};