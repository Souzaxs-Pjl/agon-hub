// =====================================================================
// Perfil.jsx - área privada para consultar e editar a própria conta.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const FORM_INICIAL = {
  nome: '',
  bio: '',
  foto_url: '',
  perfil_publico: true,
};

export default function Perfil() {
  const { usuario, carregando, atualizarUsuario, sair } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_INICIAL);
  const [arquivo, setArquivo] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (!usuario) return;
    let ativa = true;
    api('/auth/me')
      .then((dados) => {
        if (!ativa) return;
        atualizarUsuario(dados.usuario);
        setForm({
          nome: dados.usuario.nome || '',
          bio: dados.usuario.bio || '',
          foto_url: dados.usuario.foto_url || '',
          perfil_publico: dados.usuario.perfil_publico !== false,
        });
      })
      .catch((erro) => {
        if (!ativa) return;
        if (erro.status === 401) {
          sair();
          navigate('/login');
        } else {
          setMensagem({ tipo: 'erro', texto: erro.message });
        }
      })
      .finally(() => { if (ativa) setCarregandoPerfil(false); });
    return () => { ativa = false; };
  }, [usuario?.id]);

  function alterarCampo(evento) {
    const { name, value, checked, type } = evento.target;
    setForm((atual) => ({
      ...atual,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      let fotoUrl = form.foto_url;
      if (arquivo) {
        const dadosArquivo = new FormData();
        dadosArquivo.append('imagem', arquivo);
        const envio = await api('/uploads/perfil', {
          metodo: 'POST',
          corpo: dadosArquivo,
        });
        fotoUrl = envio.foto_url;
      }

      const resposta = await api('/auth/me', {
        metodo: 'PUT',
        corpo: {
          nome: form.nome,
          bio: form.bio,
          foto_url: fotoUrl,
          perfil_publico: form.perfil_publico,
        },
      });

      atualizarUsuario(resposta.usuario);
      setForm({
        nome: resposta.usuario.nome,
        bio: resposta.usuario.bio || '',
        foto_url: resposta.usuario.foto_url || '',
        perfil_publico: resposta.usuario.perfil_publico,
      });
      setArquivo(null);
      setMensagem({ tipo: 'ok', texto: 'Perfil atualizado.' });
    } catch (erro) {
      const detalhe = erro.detalhes?.join(' ') || erro.message;
      setMensagem({ tipo: 'erro', texto: detalhe });
    } finally {
      setSalvando(false);
    }
  }

  async function compartilhar() {
    const url = window.location.origin + '/perfil/' + usuario.id;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Perfil no AGON Hub', text: 'Confira meu perfil no AGON Hub.', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMensagem({ tipo: 'ok', texto: 'Link do perfil copiado.' });
      } else {
        setMensagem({ tipo: 'erro', texto: 'Não foi possível copiar o link neste navegador.' });
      }
    } catch (erro) {
      if (erro.name !== 'AbortError') {
        setMensagem({ tipo: 'erro', texto: 'Não foi possível compartilhar o perfil.' });
      }
    }
  }

  if (carregando) return <p className="aviso">Carregando sessão...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (carregandoPerfil) return <p className="aviso">Carregando perfil...</p>;

  const perfilUrl = window.location.origin + '/perfil/' + usuario.id;

  return (
    <section className="perfil-pagina">
      <p className="nota"><Link to="/">Início</Link> / Minha conta</p>
      <div className="pagina-topo">
        <div>
          <p className="etiqueta">Conta AGON</p>
          <h1>Meu perfil</h1>
          <p className="texto">Gerencie sua identidade na comunidade AGON.</p>
        </div>
        {form.perfil_publico && (
          <div className="acoes">
            <Link to={'/perfil/' + usuario.id} className="botao-secundario">Ver perfil público</Link>
            <button type="button" className="botao-primario" onClick={compartilhar}>Compartilhar</button>
          </div>
        )}
      </div>

      {mensagem.texto && (
        <p className={'aviso ' + (mensagem.tipo === 'erro' ? 'aviso-erro' : 'aviso-ok')} role="status">
          {mensagem.texto}
        </p>
      )}

      <form className="formulario cartao-form perfil-formulario" onSubmit={salvar}>
        <div className="perfil-resumo">
          {form.foto_url ? (
            <img src={form.foto_url} alt={'Foto de ' + form.nome} className="perfil-avatar" />
          ) : (
            <div className="perfil-avatar perfil-avatar-vazio">
              {form.nome ? form.nome.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <div>
            <h2>{form.nome || usuario.nome}</h2>
            <p className="pequeno">{usuario.papel === 'admin' ? 'Administrador' : 'Membro AGON'}</p>
          </div>
        </div>

        <label>
          Nome de exibição
          <input name="nome" value={form.nome} onChange={alterarCampo} minLength={2} maxLength={100} required />
        </label>

        <label>
          E-mail da conta
          <input type="email" value={usuario.email} readOnly />
        </label>

        <label>
          Biografia
          <textarea name="bio" value={form.bio} onChange={alterarCampo} rows={4} maxLength={3000} placeholder="Conte um pouco sobre você, seus interesses esportivos e sua participação na comunidade." />
        </label>

        <label>
          Foto de perfil (JPEG, PNG ou WebP; até 5 MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={salvando}
            onChange={(evento) => setArquivo(evento.target.files?.[0] || null)}
          />
        </label>
        {arquivo && <p className="pequeno">Nova imagem selecionada: {arquivo.name}</p>}
        {form.foto_url && (
          <button
            type="button"
            className="botao-secundario"
            onClick={() => { setForm((atual) => ({ ...atual, foto_url: '' })); setArquivo(null); }}
          >
            Remover foto atual
          </button>
        )}

        <label className="perfil-privacidade">
          <input type="checkbox" name="perfil_publico" checked={form.perfil_publico} onChange={alterarCampo} />
          <span>
            <strong>Perfil público</strong>
            <span className="pequeno">Permite que outras pessoas vejam seu nome, foto e biografia pelo link compartilhado.</span>
          </span>
        </label>

        <p className="nota">
          Seu e-mail e suas informações de acesso nunca aparecem no perfil público.
        </p>

        <div className="acoes">
          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          {form.perfil_publico && (
            <button type="button" className="botao-secundario" onClick={compartilhar}>
              Copiar ou compartilhar link
            </button>
          )}
        </div>
        {form.perfil_publico && <p className="pequeno">Link público: {perfilUrl}</p>}
      </form>
    </section>
  );
}
