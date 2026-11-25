// =====================================================================
// vite.config.js - configuração do servidor de desenvolvimento do React.
//
// O "proxy" faz o seguinte: quando o frontend pede /api/equipes, o Vite
// repassa o pedido para o backend em http://localhost:3000/api/equipes.
// Assim o navegador acha que tudo vem da mesma origem e não há problema de CORS.
// =====================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
});
