let version = 'unknown'
try {
  // @ts-expect-error: dynamic import of json for build-time version injection
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, import/no-unresolved
  version = (await import('./app-version.json')).version
} catch {
  // fallback to unknown
}
export const APP_VERSION = version
