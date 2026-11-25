// =====================================================================
// Login.jsx - formulário de entrada. Envia e-mail e senha para
// POST /api/auth/login (via AuthContext) e, se der certo, vai para a home.
// =====================================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault(); // impede a página de recarregar ao enviar o formulário
    setErro('');
    setEnviando(true);
    try {
      const usuario = await entrar(email, senha);
      // Administrador vai direto para o painel; os demais, para a home.
      navigate(usuario.papel === 'admin' ? '/admin' : '/');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="formulario-pagina">
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} className="formulario">
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        {erro && <p className="aviso aviso-erro">{erro}</p>}
        <button type="submit" className="botao-primario" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="pequeno">Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </section>
  );
}
