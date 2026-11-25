// =====================================================================
// AuthContext.jsx - estado de autenticação, disponível em TODA a aplicação.
//
// Fluxo:
// 1. Ao abrir o site, se existe um token salvo, pergunta ao backend
//    GET /api/auth/me "quem é este token?". Se o token for inválido ou
//    expirado, o token é apagado e o usuário fica deslogado.
// 2. Login e cadastro guardam o token e o usuário.
// 3. Sair apaga o token e o usuário.
//
// Qualquer tela usa: const { usuario, ehAdmin, entrar, sair } = useAuth();
// =====================================================================
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // "carregando" evita piscar a tela de "deslogado" enquanto o /me responde.
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function recuperarSessao() {
      if (!getToken()) {
        setCarregando(false);
        return;
      }
      try {
        const dados = await api('/auth/me');
        setUsuario(dados.usuario);
      } catch (erro) {
        // Só apaga o token se o servidor disse que ele é inválido (401).
        // Se o servidor estiver fora do ar, mantém o token para tentar depois.
        if (erro.status === 401) setToken(null);
      } finally {
        setCarregando(false);
      }
    }
    recuperarSessao();
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const dados = await api('/auth/login', {
      metodo: 'POST',
      corpo: { email, senha },
      comToken: false,
    });
    setToken(dados.token);
    setUsuario(dados.usuario);
    return dados.usuario;
  }, []);

  const cadastrar = useCallback(async (nome, email, senha) => {
    const dados = await api('/auth/register', {
      metodo: 'POST',
      corpo: { nome, email, senha },
      comToken: false,
    });
    setToken(dados.token);
    setUsuario(dados.usuario);
    return dados.usuario;
  }, []);

  const sair = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  const valor = {
    usuario,
    carregando,
    ehAdmin: usuario?.papel === 'admin',
    entrar,
    cadastrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Atalho para usar o contexto nas telas.
export function useAuth() {
  return useContext(AuthContext);
}
