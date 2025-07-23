// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path'; // <-- Importation de 'path' ajoutée

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  // La section 'build' a été supprimée. Pour une SPA, Vite
  // gère automatiquement index.html et c'est tout ce qu'il faut.

  // La section 'resolve.alias' est corrigée.
  resolve: {
    alias: {
      // On utilise un chemin relatif depuis la racine du projet,
      // c'est plus simple et ça évite les problèmes avec __dirname.
      '@': path.resolve('src'),
    }
  },
  server: {
    // Optionnel : Ouvre automatiquement le navigateur au démarrage
    open: true, 
    // Optionnel : Spécifie le port pour le serveur de développement
    port: 3000 
  }
});