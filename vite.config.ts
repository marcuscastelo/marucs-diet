import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-expect-error eslint is not typed
import eslint from 'vite-plugin-eslint'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    optimizeDeps: {
      disabled: true,
    },
    plugins: [eslint(), tsconfigPaths()],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
