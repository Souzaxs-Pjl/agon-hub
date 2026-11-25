// =====================================================================
// api.js - único lugar que faz chamadas HTTP para o backend.
//
// Todas as páginas usam a função api(). Assim, o token JWT é enviado
// sempre do mesmo jeito e os erros são tratados num lugar só.
// =====================================================================

// Chave usada para guardar o token no navegador (localStorage).
// O localStorage sobrevive a recarregar a página, então o usuário não
// precisa logar de novo a cada F5.
const CHAVE_TOKEN = 'agon_token';

export function getToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null; // navegador bloqueou o armazenamento (ex.: aba privada)
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // sem armazenamento: o login vale só nesta aba até recarregar
  }
}

// Faz uma chamada à API.
//   api('/equipes')                       -> GET
//   api('/equipes', { metodo: 'POST', corpo: {...} })
// Se a resposta não for de sucesso, lança um Error com:
//   erro.message  -> texto para mostrar ao usuário
//   erro.status   -> código HTTP (401, 403, 404, 409...)
//   erro.detalhes -> lista de problemas de validação (quando houver)
export async function api(caminho, { metodo = 'GET', corpo, comToken = true } = {}) {
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';

  const token = getToken();
  if (comToken && token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error('Não foi possível falar com o servidor. Verifique se o backend está rodando.');
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null; // resposta sem JSON (ex.: erro do servidor)
  }

  if (!resposta.ok) {
    const erro = new Error(dados?.erro || `Erro ${resposta.status}`);
    erro.status = resposta.status;
    erro.detalhes = dados?.detalhes;
    throw erro;
  }
  return dados;
}
