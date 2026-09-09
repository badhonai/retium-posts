import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 8000,
    target: 'es2018',
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true },
    },
  },
})
