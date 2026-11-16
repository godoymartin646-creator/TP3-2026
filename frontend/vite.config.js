import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  //Redirige /api al backend para evitar problemas de CORS y poder usar rutas relativas en el frontend
  server: { proxy: { '/api': 'http://localhost:3000' } },
});
