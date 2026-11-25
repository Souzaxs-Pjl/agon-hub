// =====================================================================
// App.jsx - define as rotas (qual tela aparece em cada endereço).
// O React Router troca a tela sem recarregar a página inteira.
// =====================================================================
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import RotaAdmin from './components/RotaAdmin.jsx';
import Home from './pages/Home.jsx';
import Equipes from './pages/Equipes.jsx';
import EquipeDetalhe from './pages/EquipeDetalhe.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/equipes" element={<Equipes />} />
          <Route path="/equipes/:id" element={<EquipeDetalhe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* Área protegida: RotaAdmin só mostra o painel para administradores */}
          <Route
            path="/admin"
            element={
              <RotaAdmin>
                <Admin />
              </RotaAdmin>
            }
          />
          <Route path="*" element={<p className="aviso">Página não encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
