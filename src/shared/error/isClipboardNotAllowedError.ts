// Utility to check if an error is a NotAllowedError DOMException
export function isClipboardNotAllowedError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    error.name === 'NotAllowedError'
  )
}
