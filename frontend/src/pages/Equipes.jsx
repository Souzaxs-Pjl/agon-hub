// =====================================================================
// Equipes.jsx - lista pública de equipes (qualquer visitante vê, sem login).
// =====================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Equipes() {
  const [equipes, setEquipes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api('/equipes')
      .then(setEquipes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p className="aviso">Carregando equipes...</p>;
  if (erro) return <p className="aviso aviso-erro">{erro}</p>;
  if (equipes.length === 0) return <p className="aviso">Nenhuma equipe cadastrada ainda.</p>;

  return (
    <section>
      <h1>Equipes</h1>
      <p className="nota">Dados demonstrativos (fictícios).</p>
      <div className="grade">
        {equipes.map((equipe) => (
          <Link key={equipe.id} to={`/equipes/${equipe.id}`} className="cartao">
            {equipe.logo_url ? (
              <img src={equipe.logo_url} alt={`Logo de ${equipe.nome}`} className="logo" />
            ) : (
              <div className="logo logo-vazio">{equipe.sigla}</div>
            )}
            <h2>{equipe.nome}</h2>
            <p>
              <span className="etiqueta">{equipe.sigla}</span>
              <span className="etiqueta">{equipe.tipo === 'real' ? 'Real' : 'Fictícia'}</span>
            </p>
            <p className="pequeno">{equipe.modalidade_nome}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
