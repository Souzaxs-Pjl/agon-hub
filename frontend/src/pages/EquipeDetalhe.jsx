// =====================================================================
// EquipeDetalhe.jsx - página pública de UMA equipe (rota /equipes/:id).
// O id vem da URL, lido com useParams().
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function EquipeDetalhe() {
  const { id } = useParams();
  const [equipe, setEquipe] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    api(`/equipes/${id}`)
      .then(setEquipe)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return <p className="aviso">Carregando equipe...</p>;
  if (erro) {
    return (
      <div className="aviso aviso-erro">
        <p>{erro}</p>
        <Link to="/equipes">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <article className="detalhe">
      <Link to="/equipes" className="pequeno">← Todas as equipes</Link>
      <div className="detalhe-topo">
        {equipe.logo_url ? (
          <img src={equipe.logo_url} alt={`Logo de ${equipe.nome}`} className="logo logo-grande" />
        ) : (
          <div className="logo logo-grande logo-vazio">{equipe.sigla}</div>
        )}
        <div>
          <h1>{equipe.nome}</h1>
          <p>
            <span className="etiqueta">{equipe.sigla}</span>
            <span className="etiqueta">{equipe.tipo === 'real' ? 'Real' : 'Fictícia'}</span>
            <span className="etiqueta">{equipe.modalidade_nome}</span>
          </p>
          {equipe.instituicao && <p><strong>Instituição:</strong> {equipe.instituicao}</p>}
        </div>
      </div>

      {equipe.descricao && <p className="texto">{equipe.descricao}</p>}

      <h2>Atletas</h2>
      {equipe.atletas.length === 0 ? (
        <p className="pequeno">Nenhum atleta vinculado a esta equipe.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr><th>Nome</th><th>Apelido</th><th>Função</th></tr>
          </thead>
          <tbody>
            {equipe.atletas.map((atleta) => (
              <tr key={atleta.id}>
                <td>{atleta.nome}</td>
                <td>{atleta.apelido || '—'}</td>
                <td>{atleta.funcao || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
