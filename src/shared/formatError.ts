import { ZodError } from 'zod'

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError || 
         (typeof error === 'object' && 
          error !== null && 
          'name' in error && 
          error.name === 'ZodError' &&
          'issues' in error)
}

export function getZodErrorMessage(error: ZodError): string {
  const issues = error.issues.map(issue => {
    const path = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : ''
    return `${issue.message}${path}`
  }).join('; ')
  
  return `Validation error: ${issues}`
}

export function formatError(error: unknown): string {
  if (isZodError(error)) {
    return getZodErrorMessage(error as ZodError)
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return `Unknown error: ${JSON.stringify(error, null, 2)}`
}