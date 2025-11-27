import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
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

