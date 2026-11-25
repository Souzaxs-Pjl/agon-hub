// =====================================================================
// Navbar.jsx - barra de navegação no topo, presente em todas as telas.
// Mostra links diferentes conforme o usuário está ou não logado.
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

      <nav className="links">
        <NavLink to="/equipes">Equipes</NavLink>
        {ehAdmin && <NavLink to="/admin">Administração</NavLink>}
      </nav>

      <div className="sessao">
        {carregando ? null : usuario ? (
          <>
            <span className="usuario-logado">Olá, {usuario.nome}</span>
            <button type="button" className="botao-secundario" onClick={handleSair}>
              Sair
            </button>
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
