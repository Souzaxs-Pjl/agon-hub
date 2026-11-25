import dadosDemo from './data/agon_demo_roster.json';

const ID_BASE_DEMO = 900001;
let promessaEquipes = null;

async function carregarEquipes(cabecalhos) {
  if (!promessaEquipes) {
    promessaEquipes = fetch('/api/equipes', { method: 'GET', headers: cabecalhos })
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error('Não foi possível carregar as equipes para montar os perfis demonstrativos.');
        const dados = await resposta.json();
        return Array.isArray(dados) ? dados : [];
      })
      .catch((erro) => {
        promessaEquipes = null;
        throw erro;
      });
  }
  return promessaEquipes;
}

function montarAtleta(registro, indice, equipes) {
  const equipe = equipes.find((item) => item.nome === registro.team_name);
  return {
    id: ID_BASE_DEMO + indice,
    nome: registro.name,
    apelido: registro.nickname || null,
    bio: `Perfil fictício criado exclusivamente para demonstração do AGON Hub. Integra a equipe ${registro.team_name}.`,
    foto_url: null,
    instagram_url: null,
    titulos: null,
    geracao: registro.generation || null,
    divisao: registro.division || null,
    perfil_publico: true,
    equipes: equipe ? [{
      id: equipe.id,
      nome: equipe.nome,
      sigla: equipe.sigla_oficial || equipe.sigla || null,
      funcao: 'Atleta de demonstração',
    }] : [],
  };
}

export async function respostaAtletaDemonstrativo(caminho, cabecalhos) {
  const rota = String(caminho).split('?')[0];
  const ehListaAtletas = rota === '/atletas' || rota === '/atletas/admin';
  const detalhe = rota.match(/^\/atletas\/(?:admin\/)?(\d+)$/);
  if (!ehListaAtletas && !detalhe) return { gerenciado: false };

  const equipes = await carregarEquipes(cabecalhos);
  const atletas = dadosDemo.roster.map((registro, indice) => montarAtleta(registro, indice, equipes));

  if (ehListaAtletas) return { gerenciado: true, dados: atletas };
  const indice = Number(detalhe[1]) - ID_BASE_DEMO;
  return {
    gerenciado: true,
    dados: Number.isInteger(indice) && indice >= 0 && indice < atletas.length ? atletas[indice] : null,
  };
}

export function aplicarElencoDemonstrativo(equipe) {
  if (!equipe || typeof equipe !== 'object') return equipe;
  const atletas = dadosDemo.roster
    .map((registro, indice) => ({ registro, indice }))
    .filter(({ registro }) => registro.team_name === equipe.nome)
    .map(({ registro, indice }) => ({
      id: ID_BASE_DEMO + indice,
      nome: registro.name,
      apelido: registro.nickname || null,
      geracao: registro.generation || null,
      instagram_url: null,
      titulos: null,
      bio: `Perfil fictício criado exclusivamente para demonstração do AGON Hub. Integra a equipe ${registro.team_name}.`,
      foto_url: null,
      funcao: 'Atleta de demonstração',
    }));
  return { ...equipe, atletas };
}
