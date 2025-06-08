import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  ssr: false,
  vite: {
    plugins: [tailwindcss()],
    define: {
      'process.env.APP_VERSION': JSON.stringify(
        (() => {
          try {
            const __dirname = dirname(fileURLToPath(import.meta.url))
            return execSync(resolve(__dirname, '.scripts/semver.sh'), {
              encoding: 'utf8',
            }).trim()
          } catch (e) {
            console.error('Failed to get version from .scripts/semver.sh', e)
            return 'unknown'
          }
        })(),
      ),
    },
  },
  server: {
    preset: 'vercel',
    compatibilityDate: 'latest',
  },
})
