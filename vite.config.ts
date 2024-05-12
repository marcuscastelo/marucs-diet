import { defineConfig, loadEnv } from 'vite'
import solid from 'solid-start/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-expect-error eslint is not typed
import eslint from 'vite-plugin-eslint'
import devtools from 'solid-devtools/vite'
import vercel from 'solid-start-vercel'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    optimizeDeps: {
      disabled: true,
    },
    plugins: [
      devtools({
        autoname: true, // e.g. enable autoname
        locator: {
          targetIDE: 'vscode-insiders',
          componentLocation: true,
          jsxLocation: true,
          key: 'Alt',
        },
      }),
      solid({
        ssr: false,
        adapter: vercel(),
      }),
      eslint(),
      tsconfigPaths(),
    ],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
