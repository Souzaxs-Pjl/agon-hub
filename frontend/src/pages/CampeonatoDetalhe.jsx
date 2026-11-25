// =====================================================================
// CampeonatoDetalhe.jsx - página pública de um campeonato (/:id).
// Exibe equipes, partidas e classificação calculada da fase de grupos.
// =====================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return dia && mes && ano ? [dia, mes, ano].join('/') : String(data);
}

function formatarDataHora(valor) {
  if (!valor) return 'Data a definir';
  const [data, hora] = String(valor).replace('T', ' ').split(' ');
  return formatarData(data) + (hora ? ' · ' + hora.slice(0, 5) : '');
}

function nomeStatus(status) {
  return ({
    agendada: 'Agendada',
    em_andamento: 'Em andamento',
    finalizada: 'Finalizada',
  })[status] || status || 'Status não informado';
}

function calcularClassificacao(equipes, partidas) {
  const tabela = new Map(
    equipes.map((equipe) => [Number(equipe.id), {
      id: Number(equipe.id),
      nome: equipe.nome,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      pontos: 0,
    }])
  );

  partidas
    .filter((partida) =>
      String(partida.fase || '').toLocaleLowerCase('pt-BR').includes('grupo') &&
      partida.status === 'finalizada' &&
      partida.placar_casa !== null &&
      partida.placar_visitante !== null
    )
    .forEach((partida) => {
      const casa = tabela.get(Number(partida.equipe_casa_id));
      const visitante = tabela.get(Number(partida.equipe_visitante_id));
      if (!casa || !visitante) return;

      const golsCasa = Number(partida.placar_casa);
      const golsVisitante = Number(partida.placar_visitante);

      casa.jogos += 1;
      visitante.jogos += 1;
      casa.golsPro += golsCasa;
      casa.golsContra += golsVisitante;
      visitante.golsPro += golsVisitante;
      visitante.golsContra += golsCasa;

      if (golsCasa > golsVisitante) {
        casa.vitorias += 1;
        casa.pontos += 3;
        visitante.derrotas += 1;
      } else if (golsCasa < golsVisitante) {
        visitante.vitorias += 1;
        visitante.pontos += 3;
        casa.derrotas += 1;
      } else {
        casa.empates += 1;
        visitante.empates += 1;
        casa.pontos += 1;
        visitante.pontos += 1;
      }
    });

  return [...tabela.values()]
    .map((equipe) => ({ ...equipe, saldo: equipe.golsPro - equipe.golsContra }))
    .sort((a, b) =>
      b.pontos - a.pontos ||
      b.saldo - a.saldo ||
      b.golsPro - a.golsPro ||
      b.vitorias - a.vitorias ||
      a.nome.localeCompare(b.nome, 'pt-BR')
    );
}

export default function CampeonatoDetalhe() {
  const { id } = useParams();
  const [campeonato, setCampeonato] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setErro('');

    Promise.all([
      api('/campeonatos/' + id),
      api('/partidas?campeonato_id=' + id),
    ])
      .then(([dadosCampeonato, dadosPartidas]) => {
        if (!ativa) return;
        setCampeonato(dadosCampeonato);
        setPartidas(Array.isArray(dadosPartidas) ? dadosPartidas : []);
      })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });

    return () => { ativa = false; };
  }, [id]);

  const classificacao = useMemo(
    () => calcularClassificacao(campeonato?.equipes || [], partidas),
    [campeonato, partidas]
  );

  const partidasDeGrupos = partidas.filter((partida) =>
    String(partida.fase || '').toLocaleLowerCase('pt-BR').includes('grupo')
  );

  if (carregando) return <p className="aviso">Carregando campeonato...</p>;

  if (erro) {
    return (
      <div className="aviso aviso-erro">
        <p>{erro}</p>
        <Link to="/campeonatos">Voltar para a lista de campeonatos</Link>
      </div>
    );
  }

  if (!campeonato) {
    return (
      <div className="aviso">
        <p>Campeonato não encontrado.</p>
        <Link to="/campeonatos">Voltar para a lista de campeonatos</Link>
      </div>
    );
  }

  return (
    <article className="detalhe">
      <Link to="/campeonatos" className="pequeno">← Todos os campeonatos</Link>

      <p className="etiqueta">Campeonato AGON</p>
      <h1>{campeonato.nome}{campeonato.edicao ? ' · ' + campeonato.edicao : ''}</h1>
      <p>
        {campeonato.modalidade_nome && <span className="etiqueta">{campeonato.modalidade_nome}</span>}
        {campeonato.status && <span className="etiqueta">{campeonato.status}</span>}
      </p>
      {campeonato.campeao_equipe_nome ? (
        <p className="campeao-destaque">Campeão desta edição: <strong>{campeonato.campeao_equipe_nome}</strong></p>
      ) : (
        <p className="pequeno">Campeão ainda não definido ou não cadastrado.</p>
      )}

      {(campeonato.data_inicio || campeonato.data_fim) && (
        <p className="texto">
          {campeonato.data_inicio && <>Início: {formatarData(campeonato.data_inicio)}</>}
          {campeonato.data_inicio && campeonato.data_fim && ' · '}
          {campeonato.data_fim && <>Término: {formatarData(campeonato.data_fim)}</>}
        </p>
      )}

      {campeonato.descricao ? (
        <>
          <h2>Sobre o campeonato</h2>
          <p className="texto">{campeonato.descricao}</p>
        </>
      ) : (
        <p className="pequeno">Nenhuma descrição cadastrada.</p>
      )}

      <h2>Equipes participantes</h2>
      {campeonato.equipes?.length > 0 ? (
        <div className="grade">
          {campeonato.equipes.map((equipe) => (
            <Link to={'/equipes/' + equipe.id} className="cartao" key={equipe.id}>
              <h3>{equipe.nome}</h3>
              {equipe.sigla && !String(equipe.sigla).startsWith('EQ') && <p className="etiqueta">{equipe.sigla}</p>}
              {equipe.tipo && <p className="pequeno">{equipe.tipo === 'real' ? 'Real' : 'Fictícia'}</p>}
              <span className="texto-link">Ver equipe →</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="pequeno">Nenhuma equipe inscrita neste campeonato.</p>
      )}

      <h2>Grupos e classificação</h2>
      {partidasDeGrupos.length > 0 ? (
        <>
          <p className="nota">
            Classificação geral da fase de grupos. O cadastro atual ainda não separa os participantes em grupos A, B etc.
          </p>
          {classificacao.some((equipe) => equipe.jogos > 0) ? (
            <div className="tabela-wrap">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipe</th>
                    <th>J</th>
                    <th>V</th>
                    <th>E</th>
                    <th>D</th>
                    <th>GP</th>
                    <th>GC</th>
                    <th>SG</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {classificacao.map((equipe, indice) => (
                    <tr key={equipe.id}>
                      <td>{indice + 1}</td>
                      <td><Link to={'/equipes/' + equipe.id}>{equipe.nome}</Link></td>
                      <td>{equipe.jogos}</td>
                      <td>{equipe.vitorias}</td>
                      <td>{equipe.empates}</td>
                      <td>{equipe.derrotas}</td>
                      <td>{equipe.golsPro}</td>
                      <td>{equipe.golsContra}</td>
                      <td>{equipe.saldo > 0 ? '+' : ''}{equipe.saldo}</td>
                      <td><strong>{equipe.pontos}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="pequeno">A classificação será calculada quando houver partidas da fase de grupos finalizadas.</p>
          )}
        </>
      ) : (
        <p className="pequeno">Este campeonato ainda não possui partidas cadastradas para a fase de grupos.</p>
      )}

      <h2>Partidas</h2>
      {partidas.length > 0 ? (
        <div className="grade">
          {partidas.map((partida) => (
            <Link to={'/partidas/' + partida.id} className="cartao" key={partida.id}>
              <p className="pequeno">{partida.fase || 'Partida'} · {formatarDataHora(partida.data_hora)}</p>
              <h3>{partida.equipe_casa_nome} × {partida.equipe_visitante_nome}</h3>
              <p className="placar">
                {partida.placar_casa ?? '—'} : {partida.placar_visitante ?? '—'}
              </p>
              <span className="etiqueta">{nomeStatus(partida.status)}</span>
              {partida.demonstrativo && <p className="nota">Resultado demonstrativo</p>}
              <span className="texto-link">Ver partida →</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="pequeno">Nenhuma partida cadastrada neste campeonato.</p>
      )}
    </article>
  );
}
