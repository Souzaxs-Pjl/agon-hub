import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

function itensDeTexto(valor) {
  return String(valor || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

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
  if (erro) return <div className="aviso aviso-erro"><p>{erro}</p><Link to="/atletas">Voltar para a lista</Link></div>;
  if (!atleta) return <p className="aviso">Atleta não encontrado.</p>;

  const titulos = itensDeTexto(atleta.titulos);
  const equipes = Array.isArray(atleta.equipes) ? atleta.equipes : [];

  return (
    <article className="detalhe atleta-perfil">
      <Link to="/atletas" className="pequeno">← Todos os atletas</Link>
      <header className="detalhe-topo atleta-capa">
        {atleta.foto_url ? (
          <img src={atleta.foto_url} alt={'Foto de ' + atleta.nome} className="foto-preview atleta-foto-grande" />
        ) : (
          <div className="logo logo-grande logo-vazio">{atleta.nome.slice(0, 1).toUpperCase()}</div>
        )}
        <div>
          <p className="etiqueta">Atleta AGON</p>
          <h1>{atleta.nome}</h1>
          <p className="nota">Personagem fictício criado exclusivamente para a demonstração do AGON Hub.</p>
          {atleta.apelido && <p className="texto">{atleta.apelido}</p>}
          {atleta.geracao && <span className="etiqueta">{atleta.geracao}</span>}
          {atleta.instagram_url && <p><a href={atleta.instagram_url} target="_blank" rel="noreferrer">Instagram ↗</a></p>}
        </div>
      </header>

      {atleta.bio ? <section><h2>Sobre</h2><p className="texto">{atleta.bio}</p></section> : null}

      <section>
        <h2>Títulos e conquistas</h2>
        {titulos.length ? <ul className="lista-titulos">{titulos.map((titulo, i) => <li key={i}>{titulo}</li>)}</ul> : <p className="pequeno">Nenhum título confirmado cadastrado.</p>}
      </section>

      <section>
        <h2>Equipes</h2>
        {equipes.length ? (
          <div className="grade">
            {equipes.map((equipe) => (
              <Link to={'/equipes/' + equipe.id} className="cartao" key={equipe.id}>
                <h3>{equipe.nome}</h3>
                {equipe.sigla && !String(equipe.sigla).startsWith('EQ') && <span className="etiqueta">{equipe.sigla}</span>}
                <p className="pequeno">Função: {equipe.funcao || 'Não informada'}</p>
                <span className="texto-link">Ver equipe →</span>
              </Link>
            ))}
          </div>
        ) : <p className="pequeno">Este atleta não possui equipes vinculadas.</p>}
      </section>
    </article>
  );
}
