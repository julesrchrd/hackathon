import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/camino': {
        target: 'https://api.camino.beta.gouv.fr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/camino/, ''),
      },
      '/api/gtk': {
        target: 'https://gtkdata.gtk.fi/arcgis/rest/services/Rajapinnat/GTK_Kalliopera_WFS',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/gtk/, ''),
      },
    },
  },
})
