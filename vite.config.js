import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Use our hand-written sw.js in /public — no auto-generation
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      outDir: 'dist',
      injectManifest: {
        injectionPoint: undefined, // don't inject a precache manifest
        rollupFormat: 'iife',      // output as plain JS, not ES module
      },
      manifest: false, // we have our own manifest.json in /public
      devOptions: {
        enabled: true,
        type: 'classic',
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
