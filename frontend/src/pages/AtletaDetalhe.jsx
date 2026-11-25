// =====================================================================
// AtletaDetalhe.jsx - página pública de um atleta (rota /atletas/:id).
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function AtletaDetalhe() {
  const { id } = useParams();
  const [atleta, setAtleta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setErro('');
    api('/atletas/' + id)
      .then((dados) => { if (ativa) setAtleta(dados); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, [id]);

  if (carregando) return <p className="aviso">Carregando atleta...</p>;

  if (erro) {
    return (
      <div className="aviso aviso-erro">
        <p>{erro}</p>
        <Link to="/atletas">Voltar para a lista de atletas</Link>
      </div>
    );
  }

  if (!atleta) {
    return (
      <div className="aviso">
        <p>Atleta não encontrado.</p>
        <Link to="/atletas">Voltar para a lista de atletas</Link>
      </div>
    );
  }

  return (
    <article className="detalhe">
      <Link to="/atletas" className="pequeno">← Todos os atletas</Link>

      <div className="detalhe-topo">
        {atleta.foto_url ? (
          <img
            src={atleta.foto_url}
            alt={'Foto de ' + atleta.nome}
            className="foto-preview"
          />
        ) : (
          <div className="logo logo-grande logo-vazio">
            {atleta.nome ? atleta.nome.charAt(0).toUpperCase() : 'A'}
          </div>
        )}

        <div>
          <p className="etiqueta">Atleta AGON</p>
          <h1>{atleta.nome}</h1>
          {atleta.apelido && <p className="texto">{atleta.apelido}</p>}
        </div>
      </div>

      {atleta.bio ? (
        <>
          <h2>Sobre</h2>
          <p className="texto">{atleta.bio}</p>
        </>
      ) : (
        <p className="pequeno">Nenhuma biografia cadastrada.</p>
      )}

      <h2>Equipes</h2>
      {atleta.equipes && atleta.equipes.length > 0 ? (
        <div className="grade">
          {atleta.equipes.map((equipe) => (
            <Link to={'/equipes/' + equipe.id} className="cartao" key={equipe.id}>
              <h3>{equipe.nome}</h3>
              {equipe.sigla && <p className="etiqueta">{equipe.sigla}</p>}
              <p className="pequeno">
                Função: {equipe.funcao || 'Não informada'}
              </p>
              <span className="texto-link">Ver equipe →</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="pequeno">Este atleta não possui equipes vinculadas.</p>
      )}
    </article>
  );
}
