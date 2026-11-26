// =====================================================================
// PerfilPublico.jsx - página pública compartilhável de um usuário.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ImagemComFallback from '../components/ImagemComFallback.jsx';

function formatarData(data) {
  if (!data) return '';
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return '';
  return valor.toLocaleDateString('pt-BR');
}

export default function PerfilPublico() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    api('/usuarios/' + id + '/publico', { comToken: false })
      .then((dados) => { if (ativo) setPerfil(dados); })
      .catch((falha) => { if (ativo) setErro(falha.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [id]);

  async function compartilhar() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Perfil no AGON Hub', text: 'Confira este perfil no AGON Hub.', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        window.alert('Link copiado.');
      } else {
        window.alert('Não foi possível copiar o link neste navegador.');
      }
    } catch (falha) {
      if (falha.name !== 'AbortError') window.alert('Não foi possível compartilhar o perfil.');
    }
  }

  if (carregando) return <p className="aviso">Carregando perfil...</p>;
  if (erro) {
    return (
      <section className="perfil-publico">
        <p className="etiqueta">AGON Hub</p>
        <h1>Perfil indisponível</h1>
        <p className="aviso">{erro}</p>
        <Link to="/">Voltar ao início</Link>
      </section>
    );
  }
  if (!perfil) return <p className="aviso">Perfil não encontrado.</p>;

  return (
    <article className="perfil-publico">
      <Link to="/" className="pequeno">← Universo AGON</Link>
      <div className="perfil-capa">
        {perfil.foto_url ? (
          <ImagemComFallback src={perfil.foto_url} alt={'Foto de ' + perfil.nome} className="perfil-avatar perfil-avatar-publico" fallback={perfil.nome.slice(0, 1).toUpperCase()} />
        ) : (
          <div className="perfil-avatar perfil-avatar-publico perfil-avatar-vazio">
            {perfil.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="etiqueta">Comunidade AGON</p>
          <h1>{perfil.nome}</h1>
          {perfil.criado_em && <p className="pequeno">Membro desde {formatarData(perfil.criado_em)}</p>}
        </div>
      </div>

      <h2>Sobre</h2>
      {perfil.bio ? <p className="texto">{perfil.bio}</p> : <p className="pequeno">Este membro ainda não adicionou uma biografia.</p>}

      {perfil.atleta_id && (
        <p><Link to={'/atletas/' + perfil.atleta_id}>Ver perfil esportivo de atleta →</Link></p>
      )}

      <div className="acoes">
        <button type="button" className="botao-primario" onClick={compartilhar}>Compartilhar perfil</button>
        <Link to="/" className="botao-secundario">Explorar AGON Hub</Link>
      </div>
    </article>
  );
}
