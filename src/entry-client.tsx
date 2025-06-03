// @refresh reload
import { mount, StartClient } from '@solidjs/start/client'

const appElement = document.getElementById('app')
if (appElement === null) {
  throw new Error('Root element with id "app" not found')
}
mount(() => <StartClient />, appElement)
