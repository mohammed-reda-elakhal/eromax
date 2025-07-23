// vite.config.js (VERSION CORRECTE ET RECOMMANDÉE)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  // Garde cette section si tu utilises encore react-barcode-reader quelque part
  optimizeDeps: {
    include: ['react-barcode-reader'],
  },
  resolve: {
    alias: {
      // Cette syntaxe est simple, claire et fonctionne partout.
      '@': '/src',
    }
  },
});