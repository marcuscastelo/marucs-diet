import { defineConfig } from 'vite'

export default defineConfig({
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
  plugins: [],
})
