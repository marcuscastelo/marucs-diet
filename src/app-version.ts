let version = 'unknown'
try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/no-unresolved, @typescript-eslint/no-unsafe-member-access
  version = (await import('./app-version.json')).version
} catch {
  // fallback to unknown
}
export const APP_VERSION = version
