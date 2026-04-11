import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // No proxy needed: under `vercel dev`, Vercel routes /api/* to serverless functions itself.
    // Under plain `npm run dev` (no Vercel), /api calls go to http://localhost:3000 via apiClient.js.
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure assets are always in /assets/ with hashed names
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
