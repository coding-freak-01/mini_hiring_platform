import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    // For local dev (so refreshing /candidates/1 works)
    historyApiFallback: true,
  },
  preview: {
    // For `vite preview` and deployment preview
    port: 4173,
    strictPort: true,
  }
})
