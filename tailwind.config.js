/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/flowbite/**/*.js', // configure the Flowbite JS source template paths
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      screens: {
        '3xs': '200px',
        '2xs': '300px',
        xs: '475px',
        ...defaultTheme.screens
      },
      extend: {
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
        }
      }
    }
  },
  plugins: [
    require('flowbite/plugin'),
    require('daisyui'),
    require('tw-elements/dist/plugin.cjs')
  ]
}
