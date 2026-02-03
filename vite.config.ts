import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import Json5 from 'vite-plugin-json5'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS(), Json5()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
  },
})
