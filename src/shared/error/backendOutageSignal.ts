import { createSignal } from 'solid-js'

const [backendOutage, setBackendOutage] = createSignal(false)

export { backendOutage, setBackendOutage }
