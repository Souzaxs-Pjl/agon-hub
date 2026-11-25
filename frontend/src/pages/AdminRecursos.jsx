// =====================================================================
// AdminRecursos.jsx - painel reutilizável para os CRUDs administrativos.
// Cada módulo usa a rota da API correspondente e mantém os formulários
// simples para facilitar manutenção e explicação durante a apresentação.
// =====================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const CONFIGS = {
  modalidades: {
    titulo: 'Modalidades', endpoint: '/modalidades',
    campos: [
      { nome: 'nome', rotulo: 'Nome', obrigatorio: true },
      { nome: 'tipo', rotulo: 'Tipo', tipo: 'select', obrigatorio: true, opcoes: [
        { valor: 'esporte', texto: 'Esporte tradicional' },
        { valor: 'esport', texto: 'E-sports' },
      ] },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea' },
    ],
  },
  atletas: {
    titulo: 'Atletas', endpoint: '/atletas', relacionar: 'atletas',
    fontes: ['usuarios', 'equipes'],
    campos: [
      { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true },
      { nome: 'apelido', rotulo: 'Apelido' },
      { nome: 'bio', rotulo: 'Biografia', tipo: 'textarea' },
      { nome: 'foto_url', rotulo: 'Foto atual', tipo: 'hidden' },
      { nome: 'usuario_id', rotulo: 'Conta vinculada (opcional)', tipo: 'select', fonte: 'usuarios', vazio: 'Sem conta vinculada' },
    ],
    upload: 'foto',
  },
  campeonatos: {
    titulo: 'Campeonatos', endpoint: '/campeonatos', relacionar: 'campeonatos',
    fontes: ['modalidades', 'equipes'],
    campos: [
      { nome: 'nome', rotulo: 'Nome do campeonato', obrigatorio: true },
      { nome: 'edicao', rotulo: 'Edição (ano)', tipo: 'number', obrigatorio: true },
      { nome: 'modalidade_id', rotulo: 'Modalidade', tipo: 'select', fonte: 'modalidades', obrigatorio: true },
      { nome: 'data_inicio', rotulo: 'Data de início', tipo: 'date' },
      { nome: 'data_fim', rotulo: 'Data de término', tipo: 'date' },
      { nome: 'status', rotulo: 'Situação', tipo: 'select', obrigatorio: true, opcoes: [
        { valor: 'planejado', texto: 'Planejado' },
        { valor: 'em_andamento', texto: 'Em andamento' },
        { valor: 'encerrado', texto: 'Encerrado' },
      ] },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea' },
    ],
  },
  partidas: {
    titulo: 'Partidas', endpoint: '/partidas',
    fontes: ['campeonatos', 'equipes'],
    campos: [
      { nome: 'campeonato_id', rotulo: 'Campeonato', tipo: 'select', fonte: 'campeonatos', obrigatorio: true },
      { nome: 'equipe_casa_id', rotulo: 'Equipe mandante', tipo: 'select', fonte: 'equipes', obrigatorio: true },
      { nome: 'equipe_visitante_id', rotulo: 'Equipe visitante', tipo: 'select', fonte: 'equipes', obrigatorio: true },
      { nome: 'data_hora', rotulo: 'Data e horário', tipo: 'datetime-local' },
      { nome: 'fase', rotulo: 'Fase' },
      { nome: 'placar_casa', rotulo: 'Placar mandante', tipo: 'number' },
      { nome: 'placar_visitante', rotulo: 'Placar visitante', tipo: 'number' },
      { nome: 'status', rotulo: 'Situação', tipo: 'select', obrigatorio: true, opcoes: [
        { valor: 'agendada', texto: 'Agendada' },
        { valor: 'em_andamento', texto: 'Em andamento' },
        { valor: 'finalizada', texto: 'Finalizada' },
      ] },
      { nome: 'demonstrativo', rotulo: 'Resultado demonstrativo', tipo: 'checkbox' },
    ],
  },
  noticias: {
    titulo: 'Notícias', endpoint: '/noticias',
    campos: [
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true },
      { nome: 'resumo', rotulo: 'Resumo', tipo: 'textarea' },
      { nome: 'conteudo', rotulo: 'Conteúdo', tipo: 'textarea', obrigatorio: true },
      { nome: 'imagem_url', rotulo: 'URL da imagem (opcional)' },
    ],
  },
};

function criarFormulario(config) {
  return Object.fromEntries(config.campos.map((campo) => [
    campo.nome,
    campo.tipo === 'checkbox' ? false : (campo.valorInicial ?? ''),
  ]));
}

function prepararRegistro(config, registro) {
  return Object.fromEntries(config.campos.map((campo) => {
    let valor = registro[campo.nome] ?? (campo.tipo === 'checkbox' ? false : '');
    if (campo.tipo === 'datetime-local' && valor) valor = String(valor).replace(' ', 'T').slice(0, 16);
    return [campo.nome, valor];
  }));
}

function resumir(item, tipo) {
  if (tipo === 'partidas') return `${item.equipe_casa_nome} × ${item.equipe_visitante_nome}`;
  if (tipo === 'campeonatos') return `${item.edicao} · ${item.modalidade_nome}`;
  if (tipo === 'atletas') return item.apelido || 'Atleta';
  if (tipo === 'modalidades') return item.tipo === 'esport' ? 'E-sports' : 'Esporte';
  if (tipo === 'noticias') return item.resumo || 'Notícia';
  return '';
}

export default function AdminRecursos() {
  const { recurso } = useParams();
  const { sair } = useAuth();
  const config = CONFIGS[recurso];
  const [registros, setRegistros] = useState([]);
  const [fontes, setFontes] = useState({});
  const [form, setForm] = useState(() => config ? criarFormulario(config) : {});
  const [editandoId, setEditandoId] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [vinculo, setVinculo] = useState({ id: '', funcao: '' });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [vinculando, setVinculando] = useState(false);
  const [removendoVinculoId, setRemovendoVinculoId] = useState(null);

  const opcoes = useMemo(() => fontes, [fontes]);

  useEffect(() => {
    if (!config) {
      setCarregando(false);
      return;
    }
    setForm(criarFormulario(config));
    async function carregar() {
      setCarregando(true);
      try {
        const [lista, ...listasFontes] = await Promise.all([
          api(config.endpoint),
          ...(config.fontes || []).map((fonte) => api(`/${fonte}`)),
        ]);
        setRegistros(lista);
        const mapa = {};
        (config.fontes || []).forEach((fonte, indice) => {
          mapa[fonte] = listasFontes[indice];
        });
        setFontes(mapa);
      } catch (erro) {
        tratarErro(erro);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso]);

  function tratarErro(erro) {
    if (erro.status === 401) {
      sair();
      setMensagem({ tipo: 'erro', texto: 'Sua sessão expirou. Entre novamente.' });
      return;
    }
    const detalhe = Array.isArray(erro.detalhes) ? erro.detalhes.join(' ') : '';
    setMensagem({ tipo: 'erro', texto: detalhe || erro.message });
  }

  function alterarCampo(evento) {
    const { name, value, type, checked } = evento.target;
    setForm((atual) => ({ ...atual, [name]: type === 'checkbox' ? checked : value }));
  }

  async function abrirRegistro(item) {
    setEditandoId(item.id);
    setMensagem({ tipo: '', texto: '' });
    setArquivo(null);
    try {
      const caminho = recurso === 'atletas'
        ? `/atletas/admin/${item.id}`
        : `${config.endpoint}/${item.id}`;
      const detalhe = await api(caminho);
      setSelecionado(detalhe);
      setForm(prepararRegistro(config, detalhe));
    } catch (erro) {
      tratarErro(erro);
    }
  }

  function novoRegistro() {
    setEditandoId(null);
    setSelecionado(null);
    setArquivo(null);
    setForm(criarFormulario(config));
    setMensagem({ tipo: '', texto: '' });
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });
    const corpo = { ...form };
    for (const campo of config.campos) {
      if (campo.tipo === 'number') {
        corpo[campo.nome] = corpo[campo.nome] === '' ? null : Number(corpo[campo.nome]);
      }
      if (campo.tipo === 'select' && campo.fonte) {
        corpo[campo.nome] = corpo[campo.nome] === '' ? null : Number(corpo[campo.nome]);
      }
    }

    try {
      const salvo = editandoId
        ? await api(`${config.endpoint}/${editandoId}`, { metodo: 'PUT', corpo })
        : await api(config.endpoint, { metodo: 'POST', corpo });

      const id = editandoId || salvo.id;
      // O ID é guardado imediatamente: erro no upload não transforma uma
      // segunda tentativa em outro POST e não cria um registro duplicado.
      setEditandoId(id);

      if (arquivo && config.upload === 'foto') {
        const dadosArquivo = new FormData();
        dadosArquivo.append('imagem', arquivo);
        try {
          await api(`/uploads/atletas/${id}/foto`, { metodo: 'POST', corpo: dadosArquivo });
          setArquivo(null);
        } catch (erroUpload) {
          const detalhe = erroUpload.detalhes?.join(' ') || erroUpload.message;
          setMensagem({
            tipo: 'erro',
            texto: `O atleta foi salvo, mas o envio da foto falhou: ${detalhe} Tente novamente; o formulário continuará ligado ao atleta existente e não criará outro.`,
          });
          return;
        }
      }

      const caminhoDetalhe = recurso === 'atletas'
        ? `/atletas/admin/${id}`
        : `${config.endpoint}/${id}`;
      const [lista, detalhe] = await Promise.all([
        api(config.endpoint),
        api(caminhoDetalhe),
      ]);
      setRegistros(lista);
      setSelecionado(detalhe);
      setForm(prepararRegistro(config, detalhe));
      setEditandoId(id);
      setArquivo(null);
      setMensagem({ tipo: 'ok', texto: 'Registro salvo no banco de dados.' });
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item) {
    if (excluindoId !== null) return;
    if (!window.confirm(`Excluir "${item.nome || item.titulo || item.id}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindoId(item.id);
    try {
      await api(`${config.endpoint}/${item.id}`, { metodo: 'DELETE' });
      setRegistros(await api(config.endpoint));
      if (editandoId === item.id) novoRegistro();
      setMensagem({ tipo: 'ok', texto: 'Registro excluído.' });
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setExcluindoId(null);
    }
  }

  async function adicionarVinculo(evento) {
    evento.preventDefault();
    if (!selecionado || !config.relacionar || !vinculo.id || vinculando) return;
    setVinculando(true);
    const corpo = { equipe_id: Number(vinculo.id) };
    if (config.relacionar === 'atletas') corpo.funcao = vinculo.funcao;
    try {
      const caminhoDetalhe = recurso === 'atletas'
        ? `/atletas/admin/${selecionado.id}`
        : `${config.endpoint}/${selecionado.id}`;
      await api(`${config.endpoint}/${selecionado.id}/equipes`, { metodo: 'POST', corpo });
      setSelecionado(await api(caminhoDetalhe));
      setVinculo({ id: '', funcao: '' });
      setMensagem({ tipo: 'ok', texto: 'Vínculo registrado.' });
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setVinculando(false);
    }
  }

  async function removerVinculo(equipeId) {
    if (!selecionado || removendoVinculoId !== null) return;
    setRemovendoVinculoId(equipeId);
    try {
      const caminhoDetalhe = recurso === 'atletas'
        ? `/atletas/admin/${selecionado.id}`
        : `${config.endpoint}/${selecionado.id}`;
      await api(`${config.endpoint}/${selecionado.id}/equipes/${equipeId}`, { metodo: 'DELETE' });
      setSelecionado(await api(caminhoDetalhe));
      setMensagem({ tipo: 'ok', texto: 'Vínculo removido.' });
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setRemovendoVinculoId(null);
    }
  }

  if (!config) return <p className="aviso aviso-erro">Módulo administrativo não encontrado.</p>;
  if (carregando) return <p className="aviso">Carregando {config.titulo.toLowerCase()}...</p>;

  return (
    <section className="admin">
      <div className="pagina-topo">
        <div>
          <p className="nota"><Link to="/admin">Administração</Link> / {config.titulo}</p>
          <h1>{config.titulo}</h1>
        </div>
        <button type="button" className="botao-secundario" onClick={novoRegistro} disabled={salvando}>Novo registro</button>
      </div>

      <nav className="admin-menu" aria-label="Módulos administrativos">
        <Link to="/admin">Equipes</Link>
        {Object.entries(CONFIGS).map(([chave, valor]) => (
          <Link key={chave} className={chave === recurso ? 'selecionado' : ''} to={`/admin/${chave}`}>
            {valor.titulo}
          </Link>
        ))}
      </nav>

      {mensagem.texto && (
        <p className={`aviso ${mensagem.tipo === 'erro' ? 'aviso-erro' : 'aviso-ok'}`} role="status">
          {mensagem.texto}
        </p>
      )}

      <div className="admin-colunas">
        <form onSubmit={salvar} className="formulario cartao-form">
          <h2>{editandoId ? 'Editar registro' : 'Novo registro'}</h2>
          {config.campos.filter((campo) => campo.tipo !== 'hidden').map((campo) => (
            <label key={campo.nome}>
              {campo.rotulo}
              {campo.tipo === 'textarea' ? (
                <textarea name={campo.nome} value={form[campo.nome] ?? ''} onChange={alterarCampo} rows={4} required={campo.obrigatorio} />
              ) : campo.tipo === 'select' ? (
                <select name={campo.nome} value={form[campo.nome] ?? ''} onChange={alterarCampo} required={campo.obrigatorio}>
                  <option value="">{campo.vazio || 'Selecione'}</option>
                  {(campo.opcoes || opcoes[campo.fonte] || []).map((item) => (
                    <option key={item.valor ?? item.id} value={item.valor ?? item.id}>
                      {item.texto ?? item.nome}
                    </option>
                  ))}
                </select>
              ) : campo.tipo === 'checkbox' ? (
                <input name={campo.nome} type="checkbox" checked={Boolean(form[campo.nome])} onChange={alterarCampo} />
              ) : (
                <input
                  name={campo.nome}
                  type={campo.tipo || 'text'}
                  value={form[campo.nome] ?? ''}
                  onChange={alterarCampo}
                  required={campo.obrigatorio}
                  min={campo.tipo === 'number' ? 0 : undefined}
                />
              )}
            </label>
          ))}

          {config.upload === 'foto' && (
            <label>
              Foto do atleta (JPEG, PNG ou WebP; até 5 MB)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
            </label>
          )}

          <div className="acoes">
            <button type="submit" className="botao-primario" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            {editandoId && <button type="button" className="botao-secundario" onClick={novoRegistro}>Cancelar</button>}
          </div>
          {selecionado?.foto_url && recurso === 'atletas' && (
            <img src={selecionado.foto_url} alt={`Foto de ${selecionado.nome}`} className="foto-preview" />
          )}
        </form>

        <div className="cartao-form tabela-wrap">
          <h2>Registros ({registros.length})</h2>
          {registros.length === 0 ? <p className="nota">Nenhum registro cadastrado.</p> : (
            <table className="tabela">
              <thead><tr><th>Registro</th><th>Informação</th><th>Ações</th></tr></thead>
              <tbody>
                {registros.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome || item.titulo || `#${item.id}`}</td>
                    <td>{resumir(item, recurso)}</td>
                    <td className="celula-acoes">
                      <button type="button" className="botao-secundario" onClick={() => abrirRegistro(item)}>Editar</button>
                      <button type="button" className="botao-perigo" onClick={() => excluir(item)} disabled={excluindoId !== null}>
                        {excluindoId === item.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selecionado && config.relacionar && (
        <section className="cartao-form relacoes">
          <h2>{config.relacionar === 'atletas' ? 'Equipes do atleta' : 'Equipes inscritas'}</h2>
          <form className="linha-vinculo" onSubmit={adicionarVinculo}>
            <label>
              Equipe
              <select value={vinculo.id} onChange={(e) => setVinculo((v) => ({ ...v, id: e.target.value }))} required>
                <option value="">Selecione uma equipe</option>
                {(opcoes.equipes || []).map((equipe) => <option key={equipe.id} value={equipe.id}>{equipe.nome} ({equipe.modalidade_nome || equipe.sigla})</option>)}
              </select>
            </label>
            {config.relacionar === 'atletas' && (
              <label>
                Função
                <input value={vinculo.funcao} onChange={(e) => setVinculo((v) => ({ ...v, funcao: e.target.value }))} placeholder="Ex.: Ala" />
              </label>
            )}
            <button className="botao-primario" type="submit" disabled={vinculando}>
              {vinculando ? 'Adicionando...' : 'Adicionar vínculo'}
            </button>
          </form>
          {selecionado.equipes?.length ? (
            <ul className="lista-vinculos">
              {selecionado.equipes.map((equipe) => (
                <li key={equipe.id}>
                  <span><strong>{equipe.nome}</strong>{equipe.funcao ? ` · ${equipe.funcao}` : ''}</span>
                  <button type="button" className="botao-perigo" onClick={() => removerVinculo(equipe.id)} disabled={removendoVinculoId !== null}>
                    {removendoVinculoId === equipe.id ? 'Removendo...' : 'Remover'}
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="nota">Nenhum vínculo cadastrado.</p>}
        </section>
      )}
    </section>
  );
}
