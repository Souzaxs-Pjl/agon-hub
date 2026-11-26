import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Comunidade() {
  const { usuario } = useAuth();
  const [feed, setFeed] = useState([]);
  const [texto, setTexto] = useState('');
  const [opcoesAutoria, setOpcoesAutoria] = useState({ atleta: null, equipes: [] });
  const [tipoAutor, setTipoAutor] = useState('usuario');
  const [equipeAutor, setEquipeAutor] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [publicando, setPublicando] = useState(false);
  const [curtidasPendentes, setCurtidasPendentes] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [novoComentario, setNovoComentario] = useState({});
  const [comentariosPendentes, setComentariosPendentes] = useState({});

  const carregar = useCallback(async ({ preservarScroll = false } = {}) => {
    const posicaoScroll = preservarScroll ? window.scrollY : null;
    try {
      const dados = await api('/comunidade', { comToken: false });
      setFeed(Array.isArray(dados) ? dados : []);
      if (posicaoScroll !== null) {
        requestAnimationFrame(() => window.scrollTo(0, posicaoScroll));
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!usuario) { setOpcoesAutoria({ atleta: null, equipes: [] }); setTipoAutor('usuario'); return; }
    api('/comunidade/opcoes-autoria').then(setOpcoesAutoria).catch(e => setErro(e.message));
  }, [usuario]);

  async function publicar(e) {
    e.preventDefault(); setErro('');
    if (!usuario) { setErro('Entre na sua conta para publicar.'); return; }
    if (publicando) return;
    setPublicando(true);
    try {
      const corpo = { texto: texto.trim(), tipo_autor: tipoAutor };
      if (tipoAutor === 'atleta') corpo.atleta_id = opcoesAutoria.atleta?.id;
      if (tipoAutor === 'equipe') corpo.equipe_id = Number(equipeAutor);
      const publicacao = await api('/comunidade', { metodo: 'POST', corpo });
      setTexto('');
      setFeed((atual) => [publicacao, ...atual.filter((item) => item.id !== publicacao.id)].slice(0, 50));
      // Leva o usuário ao início do feed para visualizar a publicação recém-criada.
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    } catch (e) { setErro(e.message); }
    finally { setPublicando(false); }
  }

  async function curtir(id) {
    if (!usuario) { setErro('Entre na sua conta para curtir.'); return; }
    if (curtidasPendentes[id]) return;
    setErro('');
    setCurtidasPendentes(s => ({ ...s, [id]: true }));
    try {
      const resultado = await api(`/comunidade/${id}/curtida`, { metodo: 'PUT' });
      // Atualiza somente o contador deste post; não recarrega o feed inteiro.
      setFeed(s => s.map(p => p.id === id
        ? { ...p, curtidas: Math.max(0, Number(p.curtidas || 0) + (resultado.curtida ? 1 : -1)) }
        : p));
    } catch (e) { setErro(e.message); }
    finally { setCurtidasPendentes(s => ({ ...s, [id]: false })); }
  }

  async function abrirComentarios(id) {
    try {
      const lista = await api(`/comunidade/${id}/comentarios`, { comToken: false });
      setComentarios(s => ({ ...s, [id]: lista }));
    } catch (e) {
      setErro(e.message);
    }
  }

  async function comentar(id, e) {
    e.preventDefault();
    if (!usuario) { setErro('Entre na sua conta para comentar.'); return; }
    const textoComentario = (novoComentario[id] || '').trim();
    if (!textoComentario || comentariosPendentes[id]) return;
    setErro('');
    setComentariosPendentes(s => ({ ...s, [id]: true }));
    try {
      const comentario = await api(`/comunidade/${id}/comentarios`, { metodo: 'POST', corpo: { texto: textoComentario } });
      setNovoComentario(s => ({ ...s, [id]: '' }));
      setComentarios(s => ({ ...s, [id]: [...(s[id] || []), comentario] }));
      setFeed(s => s.map(p => p.id === id ? { ...p, comentarios: Number(p.comentarios || 0) + 1 } : p));
    } catch (e) { setErro(e.message); }
    finally { setComentariosPendentes(s => ({ ...s, [id]: false })); }
  }

  async function excluirPublicacao(publicacao) {
    if (!usuario || (usuario.id !== publicacao.usuario_id && usuario.papel !== 'admin')) return;
    if (!window.confirm('Excluir esta publicação? Esta ação não pode ser desfeita.')) return;
    try {
      await api('/comunidade/' + publicacao.id, { metodo: 'DELETE' });
      setFeed(s => s.filter(p => p.id !== publicacao.id));
      setComentarios(s => { const n = { ...s }; delete n[publicacao.id]; return n; });
    } catch (e) {
      setErro(e.message);
    }
  }

  return <section className="comunidade">
    <div className="hero">
      <p className="etiqueta">AGON Community</p>
      <h1>Feed da comunidade</h1>
      <p className="lead">Converse sobre equipes, atletas e competições. Publique, curta e comente.</p>
    </div>
    {erro && <p className="aviso" role="alert">{erro}</p>}
    <form className="cartao" onSubmit={publicar}>
      <label htmlFor="tipo-autor"><strong>Publicar como</strong></label>
      <select id="tipo-autor" value={tipoAutor} onChange={e => setTipoAutor(e.target.value)} disabled={!usuario || publicando}>
        <option value="usuario">Meu perfil</option>
        {opcoesAutoria.atleta && <option value="atleta">Atleta: {opcoesAutoria.atleta.apelido || opcoesAutoria.atleta.nome}</option>}
        {opcoesAutoria.equipes.length > 0 && <option value="equipe">Equipe</option>}
      </select>
      {tipoAutor === 'equipe' && <label htmlFor="equipe-autor">Equipe
        <select id="equipe-autor" value={equipeAutor} onChange={e => setEquipeAutor(e.target.value)} required disabled={publicando}>
          <option value="">Selecione a equipe</option>
          {opcoesAutoria.equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome} ({eq.sigla})</option>)}
        </select>
      </label>}
      <label htmlFor="texto-publicacao"><strong>O que está acontecendo?</strong></label>
      <textarea id="texto-publicacao" value={texto} onChange={e => setTexto(e.target.value)} maxLength={2000} rows={4} placeholder={usuario ? 'Compartilhe com a comunidade...' : 'Entre para publicar no feed.'} disabled={!usuario || publicando} />
      <div className="acoes"><small>{texto.length}/2000</small><button className="botao-primario" disabled={!usuario || publicando || !texto.trim() || (tipoAutor === 'equipe' && !equipeAutor)}>{publicando ? 'Publicando...' : 'Publicar'}</button></div>
      {!usuario && <p className="pequeno"><Link to="/login">Entrar</Link> ou <Link to="/cadastro">criar conta</Link> para participar.</p>}
    </form>
    {carregando ? <p>Carregando feed...</p> : feed.length === 0 ? <p className="aviso">Ainda não há publicações. Seja o primeiro a participar.</p> :
      <div className="grade">
        {feed.map(p => <article className="cartao" key={p.id}>
          <div className="acoes">
            <strong>{p.tipo_autor === 'equipe' ? p.equipe_nome : p.tipo_autor === 'atleta' ? (p.atleta_apelido || p.atleta_nome) : p.usuario_nome}</strong>
            <div className="acoes">
              <small>{new Date(p.criado_em).toLocaleString('pt-BR')}</small>
              {usuario && (usuario.id === p.usuario_id || usuario.papel === 'admin') && (
                <button type="button" className="botao-perigo" onClick={() => excluirPublicacao(p)}>Apagar publicação</button>
              )}
            </div>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{p.texto}</p>
          <div className="acoes">
            <button type="button" className="botao-secundario" disabled={!usuario || curtidasPendentes[p.id]} onClick={() => curtir(p.id)}>
              {curtidasPendentes[p.id] ? 'Atualizando...' : `Curtir · ${p.curtidas}`}
            </button>
            <button type="button" className="botao-secundario" onClick={() => comentarios[p.id] ? setComentarios(s => { const n={...s}; delete n[p.id]; return n; }) : abrirComentarios(p.id)}>Comentários · {p.comentarios}</button>
          </div>
          {comentarios[p.id] && <div style={{ marginTop: '1rem' }}>
            {comentarios[p.id].map(c => <p key={c.id}><strong>{c.usuario_nome}</strong>: {c.texto}</p>)}
            <form onSubmit={e => comentar(p.id,e)} className="acoes">
              <input value={novoComentario[p.id] || ''} onChange={e => setNovoComentario(s => ({...s,[p.id]:e.target.value}))} maxLength={1000} placeholder="Escreva um comentário..." disabled={!usuario || comentariosPendentes[p.id]} />
              <button className="botao-primario" disabled={!usuario || comentariosPendentes[p.id] || !(novoComentario[p.id] || '').trim()}>{comentariosPendentes[p.id] ? 'Enviando...' : 'Enviar'}</button>
            </form>
          </div>}
        </article>)}
      </div>}
  </section>;
}
