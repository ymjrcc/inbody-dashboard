import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      clientPort: 3000,
    },
    cors: true,
  },
})
