/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    port: 5174, // Use a different port to avoid conflict if both run
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  }
})
