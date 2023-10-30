import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-expect-error eslint is not typed
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [solid(), eslint(), tsconfigPaths()]
})
