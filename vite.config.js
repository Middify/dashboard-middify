import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-datagrid': ['@mui/x-data-grid'],
          'vendor-charts': ['recharts'],
          'vendor-xlsx': ['xlsx'],
          'vendor-utils': ['axios', 'date-fns', 'react-toastify']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  }
})
