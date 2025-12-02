import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige peticiones /api al backend real
      '/api': {
        target: 'https://webs-de-vintex-login-web.1kh9sk.easypanel.host',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})