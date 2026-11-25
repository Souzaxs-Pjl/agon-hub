import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

function formatarData(data) {
  if (!data) return '';
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return String(data);
  return valor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setErro('');
    api('/noticias/' + id)
      .then((dados) => { if (ativa) setNoticia(dados); })
      .catch((e) => { if (ativa) setErro(e.message); })
      .finally(() => { if (ativa) setCarregando(false); });
    return () => { ativa = false; };
  }, [id]);

  if (carregando) return <p className="aviso">Carregando notícia...</p>;
  if (erro) return <div className="aviso aviso-erro"><p>{erro}</p><Link to="/noticias">Voltar às notícias</Link></div>;
  if (!noticia) return <p className="aviso">Notícia não encontrada.</p>;

  return (
    <article className="noticia-detalhe">
      <Link to="/noticias" className="pequeno">← Todas as notícias</Link>
      <p className="etiqueta">AGON Media</p>
      <h1>{noticia.titulo}</h1>
      <p className="pequeno">Por {noticia.autor_nome || 'Redação AGON'} · {formatarData(noticia.publicado_em)}</p>
      {noticia.imagem_url && <img src={noticia.imagem_url} alt="" className="noticia-imagem-grande" />}
      {noticia.resumo && <p className="lead">{noticia.resumo}</p>}
      <div className="noticia-conteudo">{noticia.conteudo}</div>
    </article>
  );
}
