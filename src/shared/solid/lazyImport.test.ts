import { describe, expect, it } from 'vitest'

import { lazyImport } from '~/shared/solid/lazyImport'

describe('lazyImport', () => {
  it('should create lazy-loaded exports for all module exports', () => {
    const mockModule = {
      ComponentA: () => 'ComponentA',
      ComponentB: () => 'ComponentB',
      utils: { helper: () => 'helper' },
    }

    const moduleFactory = () => Promise.resolve(mockModule)
    const lazyExports = lazyImport(moduleFactory)

    // Should have access to all exports with proper typing
    expect(lazyExports).toBeDefined()
    expect(typeof lazyExports.ComponentA).toBe('function')
    expect(typeof lazyExports.ComponentB).toBe('function')
    expect(typeof lazyExports.utils).toBe('function')
  })

  it('should create lazy-loaded exports for specific keys only', () => {
    const mockModule = {
      ComponentA: () => 'ComponentA',
      ComponentB: () => 'ComponentB',
      ComponentC: () => 'ComponentC',
    }

    const moduleFactory = () => Promise.resolve(mockModule)
    const lazyExports = lazyImport(moduleFactory, ['ComponentA', 'ComponentC'])

    // Should only have the specified keys
    expect(lazyExports).toBeDefined()
    expect(typeof lazyExports.ComponentA).toBe('function')
    expect(typeof lazyExports.ComponentC).toBe('function')
    expect(lazyExports).not.toHaveProperty('ComponentB')
  })

  it('should handle empty modules gracefully', () => {
    const moduleFactory = () => Promise.resolve({})
    const lazyExports = lazyImport(moduleFactory)

    expect(lazyExports).toBeDefined()
  })

  it('should handle modules with mixed export types', () => {
    const mockModule = {
      myComponent: () => 'component',
      myConstant: 'constant',
      myObject: { prop: 'value' },
      myNumber: 42,
    }

    const moduleFactory = () => Promise.resolve(mockModule)
    const lazyExports = lazyImport(moduleFactory)

    // All exports should be accessible
    expect(typeof lazyExports.myComponent).toBe('function')
    expect(typeof lazyExports.myConstant).toBe('function')
    expect(typeof lazyExports.myObject).toBe('function')
    expect(typeof lazyExports.myNumber).toBe('function')
  })
})
