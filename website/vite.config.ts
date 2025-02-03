import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Autoriser l'accès au serveur via l'adresse IP
    port: 3000, // Port utilisé par le serveur de développement
    cors: {
      origin: '*', // Autoriser toutes les origines pour le développement
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    },
  },
});
