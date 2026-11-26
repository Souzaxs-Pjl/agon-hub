// =====================================================================
// ConsultaPublica.jsx - listagens públicas de atletas, campeonatos,
// partidas e notícias. O conteúdo é carregado da API, não de arrays locais.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ImagemComFallback from '../components/ImagemComFallback.jsx';

const PAGINAS = {
  atletas: { titulo: 'Atletas', endpoint: '/atletas' },
  campeonatos: { titulo: 'Campeonatos', endpoint: '/campeonatos' },
  partidas: { titulo: 'Partidas', endpoint: '/partidas' },
  noticias: { titulo: 'Notícias', endpoint: '/noticias' },
};

// PostgreSQL DATE chega como AAAA-MM-DD. Formatar os componentes evita
// deslocamento de um dia por conversão de fuso horário no navegador.
function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return dia && mes && ano ? [dia, mes, ano].join('/') : String(data);
}

export default function ConsultaPublica({ tipo }) {
  const config = PAGINAS[tipo];
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 20;

  useEffect(() => {
    let ativa = true;
    if (!config) {
      setCarregando(false);
      return () => { ativa = false; };
    }
    setCarregando(true);
    setErro('');
    setPagina(1);
    api(config.endpoint)
      .then((dados) => { if (ativa) setRegistros(Array.isArray(dados) ? dados : []); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, [tipo]);

  const totalPaginas = Math.max(1, Math.ceil(registros.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const registrosVisiveis = registros.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  if (!config) return <p className="aviso aviso-erro">Página não encontrada.</p>;
  if (carregando) return <p className="aviso">Carregando {config.titulo.toLowerCase()}...</p>;
  if (erro) return <p className="aviso aviso-erro" role="alert">{erro}</p>;

  return (
    <section>
      <p className="nota"><Link to="/">Início</Link> / Universo AGON</p>
      <h1>{config.titulo}</h1>
      {tipo === 'atletas' && <p className="nota">Todos os atletas desta versão são personagens fictícios criados para demonstração.</p>}
      {registros.length === 0 ? <p className="aviso">Nenhum registro disponível.</p> : (
        <div className="grade">
          {registrosVisiveis.map((item) => {
            const conteudo = (
              <>
                {tipo === 'atletas' && (
                  <>
                    {item.foto_url && <ImagemComFallback src={item.foto_url} alt={'Foto de ' + (item.nome || item.apelido || 'atleta')} className="foto-card" fallback={(item.nome || item.apelido || 'AT').slice(0, 2).toUpperCase()} />}
                    <h2>{item.nome}</h2>
                    <p className="pequeno">{item.apelido || 'Sem apelido cadastrado'}</p>
                    {item.bio && <p>{item.bio}</p>}
                    {item.equipes?.length > 0 && (
                      <p className="pequeno">
                        <strong>Equipes:</strong>{' '}
                        {item.equipes.map((equipe) => equipe.nome).join(' · ')}
                      </p>
                    )}
                  </>
                )}
                {tipo === 'campeonatos' && (
                  <>
                    <h2>{item.nome} · {item.edicao}</h2>
                    <p>{item.modalidade_nome}</p>
                    <span className="etiqueta">{item.status}</span>
                    <p className="pequeno">{item.total_equipes} equipes inscritas</p>
                    {item.campeao_equipe_nome && <p className="campeao-destaque">Campeão: {item.campeao_equipe_nome}</p>}
                    {item.data_inicio && <p className="pequeno">Início: {formatarData(item.data_inicio)}</p>}
                  </>
                )}
                {tipo === 'partidas' && (
                  <>
                    <p className="pequeno">{item.campeonato_nome} · {item.fase || 'Partida'}</p>
                    <h2>{item.equipe_casa_nome} × {item.equipe_visitante_nome}</h2>
                    <p className="placar">{item.placar_casa ?? '—'} : {item.placar_visitante ?? '—'}</p>
                    <span className="etiqueta">{item.status}</span>
                    {item.demonstrativo && <p className="nota">Resultado demonstrativo</p>}
                  </>
                )}
                {tipo === 'noticias' && (
                  <>
                    {item.imagem_url && <ImagemComFallback src={item.imagem_url} alt={'Imagem da notícia: ' + item.titulo} className="imagem-noticia" fallback="AGON" />}
                    <h2>{item.titulo}</h2>
                    {item.resumo && <p>{item.resumo}</p>}
                    <p className="pequeno">Por {item.autor_nome || 'Redação AGON'} · {formatarData(item.publicado_em)}</p>
                    {item.conteudo && <p className="texto">{item.conteudo.slice(0, 180)}{item.conteudo.length > 180 ? '…' : ''}</p>}
                  </>
                )}
              </>
            );

            if (tipo === 'atletas') {
              return (
                <Link to={'/atletas/' + item.id} className="cartao" key={item.id}>
                  {conteudo}
                  <span className="texto-link">Ver perfil →</span>
                </Link>
              );
            }

            if (tipo === 'campeonatos') {
              return (
                <Link to={'/campeonatos/' + item.id} className="cartao" key={item.id}>
                  {conteudo}
                  <span className="texto-link">Ver campeonato →</span>
                </Link>
              );
            }

            if (tipo === 'partidas') {
              return (
                <Link to={'/partidas/' + item.id} className="cartao" key={item.id}>
                  {conteudo}
                  <span className="texto-link">Ver partida →</span>
                </Link>
              );
            }

            if (tipo === 'noticias') {
              return (
                <Link to={'/noticias/' + item.id} className="cartao" key={item.id}>
                  {conteudo}
                  <span className="texto-link">Ler notícia completa →</span>
                </Link>
              );
            }

            return <article className="cartao" key={item.id}>{conteudo}</article>;
          })}
        </div>
      )}
      {registros.length > porPagina && (
        <nav className="paginacao" aria-label={`Paginação de ${config.titulo.toLowerCase()}`}>
          <button type="button" className="botao-secundario" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaAtual <= 1}>
            Anterior
          </button>
          <span aria-live="polite">Página {paginaAtual} de {totalPaginas} · {registros.length} registros</span>
          <button type="button" className="botao-secundario" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual >= totalPaginas}>
            Próxima
          </button>
        </nav>
      )}
    </section>
  );
}
