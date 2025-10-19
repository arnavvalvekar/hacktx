import { fileURLToPath, URL } from 'node:url'

export default {
  plugins: [],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  envDir: '../', // Tell Vite to look for .env files in the parent directory
}

