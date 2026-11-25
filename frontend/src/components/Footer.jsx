import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const links = [
  { to: '/equipes', label: 'Equipes' },
  { to: '/atletas', label: 'Atletas' },
  { to: '/campeonatos', label: 'Campeonatos' },
  { to: '/partidas', label: 'Partidas' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/comunidade', label: 'Comunidade' },
];

export default function Footer() {
  const { usuario } = useAuth();

  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <div className="rodape-identidade">
          <Link to="/" className="rodape-marca" aria-label="AGON Hub — início">
            <span className="rodape-simbolo" aria-hidden="true">A</span>
            <span>AGON <strong>HUB</strong></span>
          </Link>
          <p>Mais que competição, um universo.</p>
          <span className="rodape-descricao">Esporte, e-sports, equipes e comunidade em um só lugar.</span>
        </div>

        <nav className="rodape-links" aria-label="Navegação do rodapé">
          {links.map((item) => (
            <Link to={item.to} key={item.to}>{item.label}</Link>
          ))}
          {usuario ? <Link to="/perfil">Minha conta</Link> : <Link to="/login">Entrar</Link>}
        </nav>
      </div>

      <div className="rodape-base">
        <span>© {new Date().getFullYear()} AGON Hub</span>
        <span>Universo AGON</span>
      </div>
    </footer>
  );
}
