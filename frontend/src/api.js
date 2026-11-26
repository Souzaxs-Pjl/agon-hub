// =====================================================================
// api.js - centraliza as chamadas HTTP e o envio de token JWT.
// Também aceita FormData para upload sem definir Content-Type manualmente.
// =====================================================================
const CHAVE_TOKEN = 'agon_token';

export function getToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // Sem armazenamento persistente, a sessão vale apenas até recarregar.
  }
}

export async function api(caminho, { metodo = 'GET', corpo, comToken = true } = {}) {
  const cabecalhos = {};

  // Em produção, as permissões de escrita são verificadas no backend por JWT e papel.
  const ehFormData = typeof FormData !== 'undefined' && corpo instanceof FormData;

  if (corpo !== undefined && !ehFormData) {
    cabecalhos['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (comToken && token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : (ehFormData ? corpo : JSON.stringify(corpo)),
    });
  } catch {
    throw new Error('Não foi possível estabelecer comunicação com a API. Verifique a conexão e tente novamente.');
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const erro = new Error(dados?.erro || `Erro ${resposta.status}`);
    erro.status = resposta.status;
    erro.detalhes = dados?.detalhes;
    throw erro;
  }
  return dados;
}
