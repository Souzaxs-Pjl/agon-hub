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
      <Link to="/" className="marca" aria-label="AGON Hub — início">
        <span className="marca-simbolo" aria-hidden="true">
          <svg viewBox="0 0 32 32" role="presentation" focusable="false">
            <path d="M4.5 26 16 5 27.5 26H4.5Z" />
            <path d="M10.5 18.5h11M16 5v21" />
          </svg>
        </span>
        <span className="marca-wordmark">
          <span className="marca-nome">AGON</span>
          <span className="marca-hub">HUB</span>
        </span>
      </Link>
      <nav className="links" aria-label="Navegação principal">
        <NavLink to="/equipes">Equipes</NavLink>
        <NavLink to="/atletas">Atletas</NavLink>
        <NavLink to="/campeonatos">Campeonatos</NavLink>
        <NavLink to="/partidas">Partidas</NavLink>
        <NavLink to="/noticias">Notícias</NavLink>
        <NavLink to="/comunidade">Comunidade</NavLink>
        {ehAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="sessao">
        {carregando ? null : usuario ? (
          <>
            <span className="sessao-status">Conectado</span>
            <NavLink to="/perfil" className="usuario-logado" aria-label="Abrir meu perfil">
              {usuario.nome} · Meu perfil
            </NavLink>
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
