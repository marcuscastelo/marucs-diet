/* @refresh reload */
import { render } from 'solid-js/web'

import '@/assets/styles/globals.css'
import App from '@/App'
import 'solid-devtools'

const root = document.getElementById('root')

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(() => <App />, root!)
