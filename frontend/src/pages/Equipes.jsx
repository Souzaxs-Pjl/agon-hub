import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ImagemComFallback from '../components/ImagemComFallback.jsx';
import { api } from '../api.js';

function siglaPublica(equipe) {
  return equipe.sigla_oficial || (String(equipe.codigo_fonte || '').startsWith('TEAM-') ? equipe.sigla : '');
}

export default function Equipes() {
  const [equipes, setEquipes] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    api('/equipes')
      .then((dados) => { if (ativa) setEquipes(Array.isArray(dados) ? dados : []); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, []);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return equipes;
    return equipes.filter((equipe) =>
      [equipe.nome, equipe.instituicao, equipe.cidade, siglaPublica(equipe)]
        .filter(Boolean)
        .some((valor) => String(valor).toLocaleLowerCase('pt-BR').includes(termo))
    );
  }, [equipes, busca]);

  if (carregando) return <p className="aviso">Carregando equipes...</p>;
  if (erro) return <p className="aviso aviso-erro" role="alert">{erro}</p>;

  return (
    <section>
      <div className="pagina-topo">
        <div>
          <p className="etiqueta">Universo AGON</p>
          <h1>Equipes</h1>
          <p className="texto">Conheça as equipes, suas instituições e seus elencos.</p>
        </div>
        <strong>{equipes.length} equipes</strong>
      </div>
      <label className="busca-publica">
        <span>Buscar equipe</span>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Nome, instituição ou sigla..."
        />
      </label>
      <p className="nota">Base inicial: 81 equipes identificadas. Uma equipe adicional esperada permanece pendente de identificação.</p>
      <p className="nota">Versão demonstrativa: os cadastros das equipes foram preservados; os perfis individuais de atletas são fictícios.</p>
      {filtradas.length === 0 ? (
        <p className="aviso">Nenhuma equipe encontrada para essa busca.</p>
      ) : (
        <div className="grade">
          {filtradas.map((equipe) => {
            const sigla = siglaPublica(equipe);
            const modalidade = equipe.modalidade_nome === 'Multimodal'
              ? 'Todas as modalidades'
              : equipe.modalidade_nome;
            return (
              <Link key={equipe.id} to={'/equipes/' + equipe.id} className="cartao equipe-cartao">
                {equipe.logo_url ? (
                  <ImagemComFallback src={equipe.logo_url} alt={'Logo de ' + equipe.nome} className="logo" fallback={equipe.sigla || equipe.nome.slice(0, 2).toUpperCase()} />
                ) : (
                  <div className="logo logo-vazio">{equipe.nome.slice(0, 2).toUpperCase()}</div>
                )}
                <h2>{equipe.nome}</h2>
                {sigla && <span className="etiqueta">{sigla}</span>}
                <p className="pequeno">{equipe.instituicao || 'Instituição não informada'}</p>
                <p className="pequeno">{equipe.cidade || 'Localização não informada'} · {modalidade}</p>
                <span className="texto-link">Ver perfil e elenco →</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
