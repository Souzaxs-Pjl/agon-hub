// =====================================================================
// Navbar.jsx - navegação principal responsiva.
// =====================================================================
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { usuario, carregando, ehAdmin, sair } = useAuth();
  const navigate = useNavigate();

  function handleSair() {
    sair();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="marca">AGON<span>Hub</span></Link>
      <nav className="links" aria-label="Navegação principal">
        <NavLink to="/equipes">Equipes</NavLink>
        <NavLink to="/atletas">Atletas</NavLink>
        <NavLink to="/campeonatos">Campeonatos</NavLink>
        <NavLink to="/partidas">Partidas</NavLink>
        <NavLink to="/noticias">Notícias</NavLink>
        {ehAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="sessao">
        {carregando ? null : usuario ? (
          <>
            <span className="usuario-logado">{usuario.nome}</span>
            <button type="button" className="botao-secundario" onClick={handleSair}>Sair</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Entrar</NavLink>
            <NavLink to="/cadastro" className="botao-primario">Cadastrar</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
