/* eslint-disable */
let version = 'unknown'
try {
  version = (await import('./app-version.json')).version
} catch {
  // fallback to unknown
}
export const APP_VERSION = version
