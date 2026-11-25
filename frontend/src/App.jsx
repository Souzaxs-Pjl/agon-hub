// =====================================================================
// App.jsx - rotas públicas e rotas administrativas protegidas.
// =====================================================================
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import RotaAdmin from './components/RotaAdmin.jsx';
import Home from './pages/Home.jsx';
import Equipes from './pages/Equipes.jsx';
import EquipeDetalhe from './pages/EquipeDetalhe.jsx';
import ConsultaPublica from './pages/ConsultaPublica.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Admin from './pages/Admin.jsx';
import AdminRecursos from './pages/AdminRecursos.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/equipes" element={<Equipes />} />
          <Route path="/equipes/:id" element={<EquipeDetalhe />} />
          <Route path="/atletas" element={<ConsultaPublica />} />
          <Route path="/campeonatos" element={<ConsultaPublica />} />
          <Route path="/partidas" element={<ConsultaPublica />} />
          <Route path="/noticias" element={<ConsultaPublica />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/admin" element={<RotaAdmin><Admin /></RotaAdmin>} />
          <Route path="/admin/:recurso" element={<RotaAdmin><AdminRecursos /></RotaAdmin>} />
          <Route path="*" element={<p className="aviso">Página não encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
