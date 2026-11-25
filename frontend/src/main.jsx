// =====================================================================
// main.jsx - ponto de entrada do React. Liga a aplicação à página
// index.html (na <div id="root">) e envolve tudo com os "provedores":
//   BrowserRouter -> permite trocar de página sem recarregar (React Router)
//   AuthProvider  -> guarda quem está logado, em qualquer tela
// =====================================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
