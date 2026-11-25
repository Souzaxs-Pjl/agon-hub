// =====================================================================
// Home.jsx - página inicial: identidade do AGON Hub e atalhos principais.
// (Destaques de campeonatos e partidas ficam para a próxima etapa.)
// =====================================================================
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <p className="etiqueta">Universo AGON</p>
      <h1>Mais que competição, um universo.</h1>
      <p className="lead">
        O AGON Hub reúne equipes, atletas e campeonatos de esportes tradicionais
        e e-sports em um só lugar.
      </p>
      <div className="acoes">
        <Link to="/equipes" className="botao-primario">Ver equipes</Link>
        <Link to="/login" className="botao-secundario">Entrar</Link>
      </div>
      <p className="nota">Os dados exibidos no site são demonstrativos (fictícios).</p>
    </section>
  );
}
