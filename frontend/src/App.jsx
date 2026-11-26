// =====================================================================
// App.jsx - rotas públicas e rotas administrativas protegidas.
// =====================================================================
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import RotaAdmin from './components/RotaAdmin.jsx';
import Home from './pages/Home.jsx';
import Comunidade from './pages/Comunidade.jsx';
import Equipes from './pages/Equipes.jsx';
import EquipeDetalhe from './pages/EquipeDetalhe.jsx';
import AtletaDetalhe from './pages/AtletaDetalhe.jsx';
import CampeonatoDetalhe from './pages/CampeonatoDetalhe.jsx';
import PartidaDetalhe from './pages/PartidaDetalhe.jsx';
import Perfil from './pages/Perfil.jsx';
import PerfilPublico from './pages/PerfilPublico.jsx';
import ConsultaPublica from './pages/ConsultaPublica.jsx';
import NoticiaDetalhe from './pages/NoticiaDetalhe.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Admin from './pages/Admin.jsx';
import AdminRecursos from './pages/AdminRecursos.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      {import.meta.env.PROD && (
        <p className="nota" role="status">
          Ambiente demonstrativo: parte do elenco público é fictícia. Login, cadastro, perfil e comunidade estão disponíveis. Contas Admin podem cadastrar, editar e excluir equipes, atletas, modalidades, campeonatos, partidas e notícias; a API verifica o papel da conta.
        </p>
      )}
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/equipes" element={<Equipes />} />
          <Route path="/equipes/:id" element={<EquipeDetalhe />} />
          <Route path="/atletas" element={<ConsultaPublica tipo="atletas" />} />
          <Route path="/atletas/:id" element={<AtletaDetalhe />} />
          <Route path="/campeonatos" element={<ConsultaPublica tipo="campeonatos" />} />
          <Route path="/campeonatos/:id" element={<CampeonatoDetalhe />} />
          <Route path="/partidas" element={<ConsultaPublica tipo="partidas" />} />
          <Route path="/partidas/:id" element={<PartidaDetalhe />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/:id" element={<PerfilPublico />} />
          <Route path="/noticias" element={<ConsultaPublica tipo="noticias" />} />
          <Route path="/noticias/:id" element={<NoticiaDetalhe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/admin" element={<RotaAdmin><Admin /></RotaAdmin>} />
          <Route path="/admin/:recurso" element={<RotaAdmin><AdminRecursos /></RotaAdmin>} />
          <Route path="*" element={<p className="aviso">Página não encontrada.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
