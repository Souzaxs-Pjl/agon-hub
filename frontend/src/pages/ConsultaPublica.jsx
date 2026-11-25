// =====================================================================
// ConsultaPublica.jsx - listagens públicas de atletas, campeonatos,
// partidas e notícias. O conteúdo é carregado da API, não de arrays locais.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

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
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : String(data);
}

export default function ConsultaPublica({ tipo }) {
  const config = PAGINAS[tipo];
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!config) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro('');
    api(config.endpoint)
      .then(setRegistros)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [tipo]);

  if (!config) return <p className="aviso aviso-erro">Página não encontrada.</p>;
  if (carregando) return <p className="aviso">Carregando {config.titulo.toLowerCase()}...</p>;
  if (erro) return <p className="aviso aviso-erro" role="alert">{erro}</p>;

  return (
    <section>
      <p className="nota"><Link to="/">Início</Link> / Universo AGON</p>
      <h1>{config.titulo}</h1>
      <p className="nota">Informações demonstrativas do banco de dados do AGON Hub.</p>
      {registros.length === 0 ? <p className="aviso">Nenhum registro disponível.</p> : (
        <div className="grade">
          {registros.map((item) => (
            <article className="cartao" key={item.id}>
              {tipo === 'atletas' && (
                <>
                  {item.foto_url && <img src={item.foto_url} alt="" className="foto-card" />}
                  <h2>{item.nome}</h2>
                  <p className="pequeno">{item.apelido || 'Sem apelido cadastrado'}</p>
                  {item.bio && <p>{item.bio}</p>}
                </>
              )}
              {tipo === 'campeonatos' && (
                <>
                  <h2>{item.nome} · {item.edicao}</h2>
                  <p>{item.modalidade_nome}</p>
                  <span className="etiqueta">{item.status}</span>
                  <p className="pequeno">{item.total_equipes} equipes inscritas</p>
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
                  {item.imagem_url && <img src={item.imagem_url} alt="" className="imagem-noticia" />}
                  <h2>{item.titulo}</h2>
                  {item.resumo && <p>{item.resumo}</p>}
                  <p className="pequeno">Por {item.autor_nome || 'Redação AGON'}</p>
                  <details>
                    <summary>Continuar lendo</summary>
                    <p className="texto">{item.conteudo}</p>
                  </details>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
