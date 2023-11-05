/* @refresh reload */
import { render } from 'solid-js/web'

import '@/assets/styles/globals.css'
import 'solid-devtools'

import App from '@/App'
import { Router } from '@solidjs/router'

const root = document.getElementById('root')

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  root!,
)
