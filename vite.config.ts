
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Define process.env para que o SDK do Google e o código do serviço funcionem no navegador
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': {}
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
