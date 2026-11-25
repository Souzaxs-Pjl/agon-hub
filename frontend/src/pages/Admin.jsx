// =====================================================================
// Admin.jsx - painel do administrador: lista, cria, edita e exclui equipes.
//
// Fluxo do formulário:
//   - "Nova equipe": formulário vazio. Ao salvar, faz POST /api/equipes.
//   - "Editar": preenche o formulário com a equipe escolhida. Ao salvar,
//     faz PUT /api/equipes/:id.
// Quem confere permissão é o backend; se o token expirar, o painel
// avisa e sai da sessão.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

// Valores iniciais do formulário (equipe nova).
const FORM_VAZIO = {
  nome: '',
  sigla: '',
  tipo: 'ficticia',
  modalidade_id: '',
  instituicao: '',
  descricao: '',
  logo_url: '',
  slogan: '',
  instagram_url: '',
  titulos: '',
  cidade: '',
  responsavel: '',
  cores: '',
};

export default function Admin() {
  const { sair } = useAuth();
  const [equipes, setEquipes] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null); // null = criando
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(true);
  const [logoArquivo, setLogoArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);

  // Trata erros de forma única: sessão expirada sai do sistema;
  // os demais aparecem na tela.
  function tratarErro(erro) {
    if (erro.status === 401) {
      sair();
      setMensagem({ tipo: 'erro', texto: 'Sua sessão expirou. Entre novamente.' });
      return;
    }
    const texto = erro.detalhes ? erro.detalhes.join(' ') : erro.message;
    setMensagem({ tipo: 'erro', texto });
  }

  async function carregar() {
    try {
      const [listaEquipes, listaModalidades] = await Promise.all([
        api('/equipes'),
        api('/modalidades'),
      ]);
      setEquipes(listaEquipes);
      setModalidades(listaModalidades);
      // Preenche a modalidade padrão na primeira vez.
      setForm((atual) => ({
        ...atual,
        modalidade_id: atual.modalidade_id || (listaModalidades[0]?.id ?? ''),
      }));
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function iniciarEdicao(equipe) {
    setEditandoId(equipe.id);
    setLogoArquivo(null);
    setMensagem({ tipo: '', texto: '' });
    setForm({
      nome: equipe.nome,
      sigla: equipe.sigla,
      tipo: equipe.tipo,
      modalidade_id: String(equipe.modalidade_id),
      instituicao: equipe.instituicao || '',
      descricao: equipe.descricao || '',
      logo_url: equipe.logo_url || '',
      slogan: equipe.slogan || '',
      instagram_url: equipe.instagram_url || '',
      titulos: equipe.titulos || '',
      cidade: equipe.cidade || '',
      responsavel: equipe.responsavel || '',
      cores: equipe.cores || '',
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setLogoArquivo(null);
    setForm({ ...FORM_VAZIO, modalidade_id: modalidades[0]?.id ?? '' });
    setMensagem({ tipo: '', texto: '' });
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });
    const corpo = { ...form, modalidade_id: Number(form.modalidade_id) };

    try {
      const equipeSalva = editandoId
        ? await api(`/equipes/${editandoId}`, { metodo: 'PUT', corpo })
        : await api('/equipes', { metodo: 'POST', corpo });

      // O registro já existe: qualquer nova tentativa passa a ser PUT.
      setEditandoId(equipeSalva.id);

      if (logoArquivo) {
        const dadosArquivo = new FormData();
        dadosArquivo.append('imagem', logoArquivo);
        try {
          await api(`/uploads/equipes/${equipeSalva.id}/logo`, { metodo: 'POST', corpo: dadosArquivo });
        } catch (erroUpload) {
          const detalhe = erroUpload.detalhes?.join(' ') || erroUpload.message;
          setMensagem({
            tipo: 'erro',
            texto: `A equipe foi salva, mas o envio do logo falhou: ${detalhe} Tente novamente; o formulário já está ligado à equipe salva e não criará outra.`,
          });
          return;
        }
      }

      const lista = await api('/equipes');
      setEquipes(lista);
      setMensagem({
        tipo: 'ok',
        texto: editandoId ? 'Equipe atualizada e salva no banco de dados.' : 'Equipe cadastrada e salva no banco de dados.',
      });
      setEditandoId(null);
      setLogoArquivo(null);
      setForm({ ...FORM_VAZIO, modalidade_id: modalidades[0]?.id ?? '' });
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(equipe) {
    if (excluindoId !== null) return;
    if (!window.confirm(`Excluir a equipe "${equipe.nome}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindoId(equipe.id);
    setMensagem({ tipo: '', texto: '' });
    try {
      await api(`/equipes/${equipe.id}`, { metodo: 'DELETE' });
      const lista = await api('/equipes');
      setEquipes(lista);
      setMensagem({ tipo: 'ok', texto: `Equipe "${equipe.nome}" excluída.` });
      if (editandoId === equipe.id) cancelarEdicao();
    } catch (erro) {
      tratarErro(erro);
    } finally {
      setExcluindoId(null);
    }
  }

  if (carregando) return <p className="aviso">Carregando painel...</p>;

  return (
    <section className="admin">
      <h1>Administração</h1>
      <p className="nota">Você está no painel de administrador. Dados salvos vão para o PostgreSQL.</p>
      <nav className="admin-menu" aria-label="Módulos administrativos">
        <Link className="selecionado" to="/admin">Equipes</Link>
        <Link to="/admin/modalidades">Modalidades</Link>
        <Link to="/admin/atletas">Atletas</Link>
        <Link to="/admin/campeonatos">Campeonatos</Link>
        <Link to="/admin/partidas">Partidas</Link>
        <Link to="/admin/noticias">Notícias</Link>
      </nav>

      {mensagem.texto && (
        <p className={`aviso ${mensagem.tipo === 'erro' ? 'aviso-erro' : 'aviso-ok'}`}>
          {mensagem.texto}
        </p>
      )}

      <div className="admin-colunas">
        <form onSubmit={salvar} className="formulario cartao-form">
          <h2>{editandoId ? 'Editar equipe' : 'Nova equipe'}</h2>

          <label>
            Nome
            <input name="nome" value={form.nome} onChange={alterarCampo} required />
          </label>
          <label>
            Sigla (2 a 10 letras ou números)
            <input name="sigla" value={form.sigla} onChange={alterarCampo} required maxLength={10} />
          </label>
          <label>
            Tipo
            <select name="tipo" value={form.tipo} onChange={alterarCampo}>
              <option value="ficticia">Fictícia</option>
              <option value="real">Real</option>
            </select>
          </label>
          <label>
            Modalidade
            <select name="modalidade_id" value={form.modalidade_id} onChange={alterarCampo} required>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </label>
          <label>
            Instituição (opcional)
            <input name="instituicao" value={form.instituicao} onChange={alterarCampo} />
          </label>
          <label>
            Descrição (opcional)
            <textarea name="descricao" value={form.descricao} onChange={alterarCampo} rows={3} />
          </label>
          <label>
            Slogan (opcional)
            <input name="slogan" value={form.slogan} onChange={alterarCampo} maxLength={180} />
          </label>
          <label>
            Instagram oficial (URL completa)
            <input name="instagram_url" value={form.instagram_url} onChange={alterarCampo} placeholder="https://www.instagram.com/equipe/" />
          </label>
          <label>
            Títulos e conquistas (um por linha)
            <textarea name="titulos" value={form.titulos} onChange={alterarCampo} rows={3} />
          </label>
          <label>
            Cidade
            <input name="cidade" value={form.cidade} onChange={alterarCampo} maxLength={100} />
          </label>
          <label>
            Responsável ou referência registrada
            <input name="responsavel" value={form.responsavel} onChange={alterarCampo} maxLength={150} />
          </label>
          <label>
            Cores de referência
            <input name="cores" value={form.cores} onChange={alterarCampo} maxLength={180} />
          </label>
          <label>
            URL externa do logo (opcional)
            <input name="logo_url" value={form.logo_url} onChange={alterarCampo} placeholder="https://..." />
          </label>
          <label>
            Enviar arquivo de logo (JPEG, PNG ou WebP; até 5 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={salvando} onChange={(e) => setLogoArquivo(e.target.files?.[0] || null)} />
          </label>

          <div className="acoes">
            <button type="submit" className="botao-primario" disabled={salvando}>
              {salvando ? 'Salvando...' : (editandoId ? 'Salvar alterações' : 'Cadastrar equipe')}
            </button>
            {editandoId && (
              <button type="button" className="botao-secundario" onClick={cancelarEdicao}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="cartao-form">
          <h2>Equipes cadastradas ({equipes.length})</h2>
          <table className="tabela">
            <thead>
              <tr><th>Nome</th><th>Sigla</th><th>Modalidade</th><th></th></tr>
            </thead>
            <tbody>
              {equipes.map((equipe) => (
                <tr key={equipe.id}>
                  <td>{equipe.nome}</td>
                  <td>{equipe.sigla_oficial || (String(equipe.codigo_fonte || '').startsWith('TEAM-') ? equipe.sigla : '—')}</td>
                  <td>{equipe.modalidade_nome === 'Multimodal' ? 'Todas as modalidades' : equipe.modalidade_nome}</td>
                  <td className="celula-acoes">
                    <button type="button" className="botao-secundario" onClick={() => iniciarEdicao(equipe)}>
                      Editar
                    </button>
                    <button type="button" className="botao-perigo" onClick={() => excluir(equipe)} disabled={excluindoId !== null}>
                      {excluindoId === equipe.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
