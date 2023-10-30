import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import eslint from 'vite-plugin-eslint'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [solid(), eslint(), tsconfigPaths()]
})
