import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Alias "@" → carpeta src (imports más limpios: "@/components/...")
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      // El proyecto vive dentro de OneDrive: el watcher normal de Vite se
      // pierde cambios de archivos ahí y el HMR queda sirviendo código viejo
      // (mezclas imposibles de UI). El polling revisa los archivos cada tanto
      // y detecta los cambios siempre.
      usePolling: true,
      interval: 300,
    },
  },
})
