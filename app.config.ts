import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  ssr: false,
  vite: {
    plugins: [tailwindcss()],
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
  server: {
    preset: 'vercel',
    compatibilityDate: 'latest',
  },
})
