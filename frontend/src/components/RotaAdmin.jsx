// =====================================================================
// RotaAdmin.jsx - "porteiro" da área administrativa.
//
// IMPORTANTE: esconder o link no menu NÃO é segurança. Quem protege de
// verdade é o backend (middlewares autenticar + exigirAdmin). Este componente
// existe só para mostrar a mensagem certa ao usuário.
// =====================================================================
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function RotaAdmin({ children }) {
  const { usuario, carregando, ehAdmin } = useAuth();

  if (carregando) {
    return <p className="aviso">Verificando sua sessão...</p>;
  }

  // Caso 1: ninguém logado
  if (!usuario) {
    return (
      <div className="aviso">
        <p>Você precisa entrar para acessar a área administrativa.</p>
        <Link to="/login" className="botao-primario">Ir para o login</Link>
      </div>
    );
  }

  // Caso 2: logado, mas sem papel de administrador
  if (!ehAdmin) {
    return (
      <div className="aviso">
        <p>Acesso negado: esta área é exclusiva de administradores.</p>
        <Link to="/">Voltar para o início</Link>
      </div>
    );
  }

  return children;
}
