// =====================================================================
// Home.jsx - entrada da plataforma e atalhos para as áreas públicas.
// =====================================================================
import { Link } from 'react-router-dom';

const atalhos = [
  { to: '/equipes', titulo: 'Equipes', texto: 'Conheça equipes e suas modalidades.' },
  { to: '/atletas', titulo: 'Atletas', texto: 'Consulte os atletas cadastrados.' },
  { to: '/campeonatos', titulo: 'Campeonatos', texto: 'Veja competições e inscrições.' },
  { to: '/partidas', titulo: 'Partidas', texto: 'Acompanhe partidas e placares.' },
  { to: '/noticias', titulo: 'Notícias', texto: 'Leia os conteúdos publicados.' },
];

export default function Home() {
  return (
    <section>
      <div className="hero">
        <p className="etiqueta">Universo AGON</p>
        <h1>Mais que competição, um universo.</h1>
        <p className="lead">
          O AGON Hub conecta informações de equipes, atletas, modalidades,
          campeonatos e partidas de esportes tradicionais e e-sports.
        </p>
        <div className="acoes">
          <Link to="/equipes" className="botao-primario">Explorar equipes</Link>
          <Link to="/login" className="botao-secundario">Entrar na plataforma</Link>
        </div>
        <p className="nota">Os registros do banco de demonstração são fictícios.</p>
      </div>
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
