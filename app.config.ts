import { defineConfig } from '@solidjs/start/config'

export default defineConfig({
  ssr: false,
  nitro: {
    compatibilityDate: '2025-06-07',
  },
  server: {
    preset: 'vercel',
  },
  vite: {
    plugins: [],
    define: {
      'process.env.APP_VERSION': JSON.stringify(
        (() => {
          console.log(
            'process.env.npm_package_version',
            process.env.npm_package_version,
          )
          return process.env.npm_package_version
        })(),
      ),
    },
  },
})
