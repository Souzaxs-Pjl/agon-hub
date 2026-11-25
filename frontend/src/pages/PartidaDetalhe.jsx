// =====================================================================
// PartidaDetalhe.jsx - página pública de uma partida (/:id).
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

function formatarDataHora(valor) {
  if (!valor) return 'Data a definir';
  const [data, hora] = String(valor).replace('T', ' ').split(' ');
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  const dataFormatada = dia && mes && ano ? [dia, mes, ano].join('/') : data;
  return dataFormatada + (hora ? ' · ' + hora.slice(0, 5) : '');
}

function nomeStatus(status) {
  return ({
    agendada: 'Agendada',
    em_andamento: 'Em andamento',
    finalizada: 'Finalizada',
  })[status] || status || 'Status não informado';
}

export default function PartidaDetalhe() {
  const { id } = useParams();
  const [partida, setPartida] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setErro('');
    api('/partidas/' + id)
      .then((dados) => { if (ativa) setPartida(dados); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, [id]);

  if (carregando) return <p className="aviso">Carregando partida...</p>;

  if (erro) {
    return (
      <div className="aviso aviso-erro">
        <p>{erro}</p>
        <Link to="/partidas">Voltar para as partidas</Link>
      </div>
    );
  }

  if (!partida) {
    return (
      <div className="aviso">
        <p>Partida não encontrada.</p>
        <Link to="/partidas">Voltar para as partidas</Link>
      </div>
    );
  }

  const placarDisponivel = partida.placar_casa !== null && partida.placar_visitante !== null;

  return (
    <article className="detalhe">
      <Link to={'/campeonatos/' + partida.campeonato_id} className="pequeno">
        ← Voltar para {partida.campeonato_nome}
      </Link>

      <p className="etiqueta">{partida.fase || 'Partida'}</p>
      <h1>{partida.equipe_casa_nome} × {partida.equipe_visitante_nome}</h1>
      <p className="placar">
        {placarDisponivel ? partida.placar_casa + ' : ' + partida.placar_visitante : '— : —'}
      </p>
      <p>
        <span className="etiqueta">{nomeStatus(partida.status)}</span>
        {partida.demonstrativo && <span className="etiqueta">Demonstrativo</span>}
      </p>
      <p className="texto">{formatarDataHora(partida.data_hora)}</p>

      <h2>Equipes</h2>
      <div className="grade">
        <Link to={'/equipes/' + partida.equipe_casa_id} className="cartao">
          <h3>{partida.equipe_casa_nome}</h3>
          <span className="texto-link">Ver equipe →</span>
        </Link>
        <Link to={'/equipes/' + partida.equipe_visitante_id} className="cartao">
          <h3>{partida.equipe_visitante_nome}</h3>
          <span className="texto-link">Ver equipe →</span>
        </Link>
      </div>
    </article>
  );
}
