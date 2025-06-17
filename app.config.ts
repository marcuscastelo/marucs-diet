import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  ssr: false,
  vite: {
    plugins: [tailwindcss()],
    define: {},
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
        '~/assets': resolve(__dirname, 'assets'),
      },
    },
  },
  server: {
    preset: 'vercel',
    compatibilityDate: 'latest',
  },
})
