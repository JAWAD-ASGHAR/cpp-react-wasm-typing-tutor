import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    exclude: ['../typing.js']
  },
  build: {
    commonjsOptions: {
      include: [/typing\.js$/, /node_modules/],
      transformMixedEsModules: true
    }
  }
})

