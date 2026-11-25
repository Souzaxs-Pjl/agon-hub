// =====================================================================
// CampeonatoDetalhe.jsx - página pública de um campeonato (/:id).
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return dia && mes && ano ? [dia, mes, ano].join('/') : String(data);
}

export default function CampeonatoDetalhe() {
  const { id } = useParams();
  const [campeonato, setCampeonato] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setErro('');
    api('/campeonatos/' + id)
      .then((dados) => { if (ativa) setCampeonato(dados); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, [id]);

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
      {campeonato.equipes && campeonato.equipes.length > 0 ? (
        <div className="grade">
          {campeonato.equipes.map((equipe) => (
            <Link to={'/equipes/' + equipe.id} className="cartao" key={equipe.id}>
              <h3>{equipe.nome}</h3>
              {equipe.sigla && <p className="etiqueta">{equipe.sigla}</p>}
              {equipe.tipo && <p className="pequeno">{equipe.tipo === 'real' ? 'Real' : 'Fictícia'}</p>}
              <span className="texto-link">Ver equipe →</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="pequeno">Nenhuma equipe inscrita neste campeonato.</p>
      )}
    </article>
  );
}
