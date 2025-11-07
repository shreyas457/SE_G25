import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { coverageV8 } from '@vitest/coverage-v8'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],   // lcov required for coverage upload
      reportsDirectory: './coverage',
    },
  },
})
