const DEBUG_ENABLED = true
export function createDebug(moduleName: string) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!DEBUG_ENABLED) {
    return () => {
      // No-op if debugging is disabled
    }
  }

  return (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.debug(`[${moduleName}] ${message}`, ...args)
  }
}
