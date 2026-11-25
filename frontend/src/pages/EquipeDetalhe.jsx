import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

function siglaPublica(equipe) {
  return equipe.sigla_oficial || (String(equipe.codigo_fonte || '').startsWith('TEAM-') ? equipe.sigla : '');
}

function itensDeTexto(valor) {
  return String(valor || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export default function EquipeDetalhe() {
  const { id } = useParams();
  const [equipe, setEquipe] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setErro('');
    api('/equipes/' + id)
      .then((dados) => { if (ativa) setEquipe(dados); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, [id]);

  if (carregando) return <p className="aviso">Carregando equipe...</p>;
  if (erro) return <div className="aviso aviso-erro"><p>{erro}</p><Link to="/equipes">Voltar para a lista</Link></div>;
  if (!equipe) return <p className="aviso">Equipe não encontrada.</p>;

  const sigla = siglaPublica(equipe);
  const titulos = itensDeTexto(equipe.titulos);
  const atletas = Array.isArray(equipe.atletas) ? equipe.atletas : [];
  const modalidade = equipe.modalidade_nome === 'Multimodal' ? 'Todas as modalidades' : equipe.modalidade_nome;

  return (
    <article className="detalhe equipe-perfil">
      <Link to="/equipes" className="pequeno">← Todas as equipes</Link>
      <header className="detalhe-topo equipe-capa">
        {equipe.logo_url ? (
          <img src={equipe.logo_url} alt={'Logo de ' + equipe.nome} className="logo logo-grande" />
        ) : (
          <div className="logo logo-grande logo-vazio">{equipe.nome.slice(0, 2).toUpperCase()}</div>
        )}
        <div>
          <p className="etiqueta">Equipe AGON</p>
          <h1>{equipe.nome}</h1>
          {sigla && <span className="etiqueta">{sigla}</span>}
          <span className="etiqueta">{modalidade}</span>
          {equipe.instituicao && <p><strong>Instituição:</strong> {equipe.instituicao}</p>}
          {equipe.cidade && <p className="pequeno">{equipe.cidade}</p>}
          {equipe.instagram_url && (
            <a href={equipe.instagram_url} target="_blank" rel="noreferrer">Instagram oficial ↗</a>
          )}
        </div>
      </header>

      {equipe.slogan && <p className="equipe-slogan">“{equipe.slogan}”</p>}
      {equipe.descricao && <section><h2>Sobre a equipe</h2><p className="texto">{equipe.descricao}</p></section>}

      <section className="equipe-dados">
        <h2>Identidade e informações</h2>
        <div className="grade">
          {equipe.responsavel && <div className="cartao"><strong>Referência registrada</strong><p>{equipe.responsavel}</p><p className="nota">Informação da base de referência; função e vigência podem precisar de revalidação.</p></div>}
          {equipe.cores && <div className="cartao"><strong>Cores de referência</strong><p>{equipe.cores}</p></div>}
          {equipe.codigo_fonte && <div className="cartao"><strong>Identificação da fonte</strong><p>{equipe.codigo_fonte}</p></div>}
        </div>
      </section>

      <section>
        <h2>Títulos e conquistas</h2>
        {titulos.length ? (
          <ul className="lista-titulos">{titulos.map((titulo, i) => <li key={i}>{titulo}</li>)}</ul>
        ) : <p className="pequeno">Nenhum título confirmado cadastrado.</p>}
      </section>

      <section>
        <div className="pagina-topo">
          <div><h2>Elenco</h2><p className="pequeno">{atletas.length} perfil(is) demonstrativo(s)</p></div>
        </div>
        <p className="nota">Os nomes e perfis individuais exibidos nesta versão são fictícios e foram criados para a apresentação. Os cadastros das equipes e instituições foram mantidos.</p>
        {atletas.length === 0 ? (
          <p className="aviso">Nenhum perfil individual está público no momento. O elenco só aparece aqui após a autorização de publicação ser confirmada e registrada.</p>
        ) : (
          <div className="grade elenco-grade">
            {atletas.map((atleta) => (
              <Link to={'/atletas/' + atleta.id} className="cartao atleta-cartao" key={atleta.id}>
                {atleta.foto_url ? (
                  <img src={atleta.foto_url} alt="" className="foto-card atleta-avatar" />
                ) : (
                  <div className="foto-card atleta-avatar atleta-avatar-vazio">{atleta.nome.slice(0, 1).toUpperCase()}</div>
                )}
                <div>
                  <h3>{atleta.nome}</h3>
                  {atleta.apelido && <p className="pequeno">{atleta.apelido}</p>}
                  {atleta.funcao && <span className="etiqueta">{atleta.funcao}</span>}
                  {atleta.geracao && <p className="pequeno">{atleta.geracao}</p>}
                  <span className="texto-link">Abrir perfil →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
