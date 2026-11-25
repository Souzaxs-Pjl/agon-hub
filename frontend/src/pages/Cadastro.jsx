// =====================================================================
// Cadastro.jsx - cria uma conta de usuário comum (POST /api/auth/register).
// Não há campo para escolher papel: o backend sempre cria 'usuario'.
// =====================================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await cadastrar(nome, email, senha);
      navigate('/');
    } catch (e) {
      // Se o backend devolveu uma lista de problemas, mostra todos.
      setErro(e.detalhes ? e.detalhes.join(' ') : e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="formulario-pagina">
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit} className="formulario">
        <label>
          Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha (mínimo 8 caracteres)
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} />
        </label>
        {erro && <p className="aviso aviso-erro">{erro}</p>}
        <button type="submit" className="botao-primario" disabled={enviando}>
          {enviando ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <p className="pequeno">Já tem conta? <Link to="/login">Entrar</Link></p>
    </section>
  );
}
