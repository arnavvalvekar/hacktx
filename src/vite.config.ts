import { fileURLToPath, URL } from 'node:url'

export default {
  plugins: [],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}

