import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.otf'],
  plugins: [react()],
  build: {
    outDir: '../dist', // Output directory relative to root
  },
})
