// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'; // <-- Importer

export default defineConfig({
  plugins: [
    react(),
    svgr() // <-- Ajouter le plugin
  ],
   build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        offline: 'public/offline.html' // <-- Problematic entry
      }
    }
  }
});