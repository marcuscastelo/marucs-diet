/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/flowbite/**/*.js', // configure the Flowbite JS source template paths
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [
    require('daisyui'),
    require('flowbite/plugin'),
    require('tw-elements/dist/plugin.cjs')
  ]
}
