
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fix: Removed manual environment variable loading and process.env definition.
// This resolves the error where process.cwd() is not available and ensures 
// process.env.API_KEY is handled by the platform as per guidelines.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
