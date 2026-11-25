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
  const [comentarios, setComentarios] = useState({});
  const [novoComentario, setNovoComentario] = useState({});

  const carregar = useCallback(async () => {
    try { setFeed(await api('/comunidade', { comToken: false })); }
    catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!usuario) { setOpcoesAutoria({ atleta: null, equipes: [] }); setTipoAutor('usuario'); return; }
    api('/comunidade/opcoes-autoria').then(setOpcoesAutoria).catch(e => setErro(e.message));
  }, [usuario]);

  async function publicar(e) {
    e.preventDefault(); setErro('');
    if (!usuario) { setErro('Entre na sua conta para publicar.'); return; }
    try {
      const corpo = { texto, tipo_autor: tipoAutor };
      if (tipoAutor === 'atleta') corpo.atleta_id = opcoesAutoria.atleta?.id;
      if (tipoAutor === 'equipe') corpo.equipe_id = Number(equipeAutor);
      await api('/comunidade', { metodo: 'POST', corpo });
      setTexto(''); await carregar();
    } catch (e) { setErro(e.message); }
  }

  async function curtir(id) {
    if (!usuario) { setErro('Entre na sua conta para curtir.'); return; }
    try { await api(`/comunidade/${id}/curtida`, { metodo: 'PUT' }); await carregar(); }
    catch (e) { setErro(e.message); }
  }

  async function abrirComentarios(id) {
    try { setComentarios(s => ({ ...s, [id]: await api(`/comunidade/${id}/comentarios`, { comToken: false }) })); }
    catch (e) { setErro(e.message); }
  }

  async function comentar(id, e) {
    e.preventDefault();
    if (!usuario) { setErro('Entre na sua conta para comentar.'); return; }
    const textoComentario = (novoComentario[id] || '').trim();
    if (!textoComentario) return;
    try {
      await api(`/comunidade/${id}/comentarios`, { metodo: 'POST', corpo: { texto: textoComentario } });
      setNovoComentario(s => ({ ...s, [id]: '' }));
      await abrirComentarios(id); await carregar();
    } catch (e) { setErro(e.message); }
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
      <select id="tipo-autor" value={tipoAutor} onChange={e => setTipoAutor(e.target.value)} disabled={!usuario}>
        <option value="usuario">Meu perfil</option>
        {opcoesAutoria.atleta && <option value="atleta">Atleta: {opcoesAutoria.atleta.apelido || opcoesAutoria.atleta.nome}</option>}
        {opcoesAutoria.equipes.length > 0 && <option value="equipe">Equipe</option>}
      </select>
      {tipoAutor === 'equipe' && <label htmlFor="equipe-autor">Equipe
        <select id="equipe-autor" value={equipeAutor} onChange={e => setEquipeAutor(e.target.value)} required>
          <option value="">Selecione a equipe</option>
          {opcoesAutoria.equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome} ({eq.sigla})</option>)}
        </select>
      </label>}
      <label htmlFor="texto-publicacao"><strong>O que está acontecendo?</strong></label>
      <textarea id="texto-publicacao" value={texto} onChange={e => setTexto(e.target.value)} maxLength={2000} rows={4} placeholder={usuario ? 'Compartilhe com a comunidade...' : 'Entre para publicar no feed.'} disabled={!usuario} />
      <div className="acoes"><small>{texto.length}/2000</small><button className="botao-primario" disabled={!usuario || !texto.trim() || (tipoAutor === 'equipe' && !equipeAutor)}>Publicar</button></div>
      {!usuario && <p className="pequeno"><Link to="/login">Entrar</Link> ou <Link to="/cadastro">criar conta</Link> para participar.</p>}
    </form>
    {carregando ? <p>Carregando feed...</p> : feed.length === 0 ? <p className="aviso">Ainda não há publicações. Seja o primeiro a participar.</p> :
      <div className="grade">
        {feed.map(p => <article className="cartao" key={p.id}>
          <div className="acoes">
            <strong>{p.tipo_autor === 'equipe' ? p.equipe_nome : p.tipo_autor === 'atleta' ? (p.atleta_apelido || p.atleta_nome) : p.usuario_nome}</strong>
            <small>{new Date(p.criado_em).toLocaleString('pt-BR')}</small>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{p.texto}</p>
          <div className="acoes">
            <button className="botao-secundario" onClick={() => curtir(p.id)}>Curtir · {p.curtidas}</button>
            <button className="botao-secundario" onClick={() => comentarios[p.id] ? setComentarios(s => { const n={...s}; delete n[p.id]; return n; }) : abrirComentarios(p.id)}>Comentários · {p.comentarios}</button>
          </div>
          {comentarios[p.id] && <div style={{ marginTop: '1rem' }}>
            {comentarios[p.id].map(c => <p key={c.id}><strong>{c.usuario_nome}</strong>: {c.texto}</p>)}
            <form onSubmit={e => comentar(p.id,e)} className="acoes">
              <input value={novoComentario[p.id] || ''} onChange={e => setNovoComentario(s => ({...s,[p.id]:e.target.value}))} maxLength={1000} placeholder="Escreva um comentário..." />
              <button className="botao-primario" disabled={!usuario || !(novoComentario[p.id] || '').trim()}>Enviar</button>
            </form>
          </div>}
        </article>)}
      </div>}
  </section>;
}
