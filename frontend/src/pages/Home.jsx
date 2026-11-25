import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const atalhos = [
  { to: '/equipes', titulo: 'Equipes', texto: 'Conheça equipes e seus elencos.' },
  { to: '/atletas', titulo: 'Atletas', texto: 'Consulte os perfis dos integrantes.' },
  { to: '/campeonatos', titulo: 'Campeonatos', texto: 'Veja competições, tabelas e campeões.' },
  { to: '/partidas', titulo: 'Partidas', texto: 'Acompanhe jogos, resultados e detalhes.' },
  { to: '/noticias', titulo: 'Notícias', texto: 'Leia os conteúdos completos.' },
  { to: '/comunidade', titulo: 'Comunidade', texto: 'Publique, curta e comente.' },
];

export default function Home() {
  const [campeoes, setCampeoes] = useState([]);

  useEffect(() => {
    let ativa = true;
    api('/campeonatos')
      .then((dados) => {
        if (ativa) setCampeoes((Array.isArray(dados) ? dados : []).filter((item) => item.campeao_equipe_nome).slice(0, 4));
      })
      .catch(() => { if (ativa) setCampeoes([]); });
    return () => { ativa = false; };
  }, []);

  return (
    <section>
      <div className="hero">
        <p className="etiqueta">Universo AGON</p>
        <h1>Mais que competição, um universo.</h1>
        <p className="lead">
          O AGON Hub conecta equipes, atletas, modalidades, campeonatos,
          partidas, notícias e comunidade em um só lugar.
        </p>
        <div className="acoes">
          <Link to="/equipes" className="botao-primario">Explorar equipes</Link>
          <Link to="/campeonatos" className="botao-secundario">Acompanhar campeonatos</Link>
        </div>
      </div>

      <section className="home-campeoes">
        <div className="pagina-topo">
          <div><p className="etiqueta">Histórico competitivo</p><h2>Últimos campeões</h2></div>
          <Link to="/campeonatos">Ver campeonatos →</Link>
        </div>
        {campeoes.length ? (
          <div className="grade">
            {campeoes.map((item) => (
              <Link to={'/campeonatos/' + item.id} className="cartao" key={item.id}>
                <p className="pequeno">{item.nome} · {item.edicao}</p>
                <h3>{item.campeao_equipe_nome}</h3>
                <span className="texto-link">Ver edição →</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="aviso">Os campeões serão exibidos aqui quando as finais oficiais forem cadastradas e concluídas.</p>
        )}
      </section>

      <div className="grade atalhos-home">
        {atalhos.map((atalho) => (
          <Link to={atalho.to} className="cartao" key={atalho.to}>
            <h2>{atalho.titulo}</h2>
            <p className="pequeno">{atalho.texto}</p>
            <span className="texto-link">Acessar →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
