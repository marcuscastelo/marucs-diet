/**
 * Utility functions for deep object comparison.
 * These are pure functions with no side effects.
 */

/**
 * Performs deep equality comparison between two objects.
 * More reliable than JSON.stringify for comparing objects.
 */
export function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true
  
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return false
  
  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)
  
  if (aKeys.length !== bKeys.length) return false
  
  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false
    if (!deepEquals(aObj[key], bObj[key])) return false
  }
  
  return true
}

/**
 * Compares macro nutrients objects for equality.
 * Specialized function for macro comparison with proper floating point handling.
 */
export function macrosAreEqual(macros1: any, macros2: any): boolean {
  if (!macros1 || !macros2) return macros1 === macros2
  
  const keys = ['calories', 'protein', 'carbs', 'fat'] // Add other macro keys as needed
  
  return keys.every(key => {
    const val1 = macros1[key]
    const val2 = macros2[key]
    
    // Handle floating point comparison with small epsilon
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return Math.abs(val1 - val2) < 0.001
    }
    
    return val1 === val2
  })
}
