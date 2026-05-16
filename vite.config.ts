import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages({ entry: 'src/index-v9.tsx' })],
  build: {
    outDir: 'dist'
  }
})
