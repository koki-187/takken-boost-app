
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    hmr: {
      protocol: 'ws',
      host: '5173-igv6uc9jl3f1z9v3p46jv-4622be4c.manus.computer',
      clientPort: 443
    }
  }
})


