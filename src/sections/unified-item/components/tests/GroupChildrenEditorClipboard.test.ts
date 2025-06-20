import { describe, expect, it } from 'vitest'
import { createSignal } from 'solid-js'

import { addChildToItem } from '~/modules/diet/unified-item/domain/childOperations'
import { validateItemHierarchy } from '~/modules/diet/unified-item/domain/validateItemHierarchy'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { GroupChildrenEditor } from '~/modules/diet/unified-item/ui/GroupChildrenEditor'
import { useCopyPasteActions } from '~/modules/diet/unified-item/ui/CopyPasteProvider'

describe('GroupChildrenEditor Clipboard Functionality', () => {
  const createFoodItem = (id: number, name: string) =>
    createUnifiedItem({
      id,
      name,
      quantity: 100,
      reference: {
        type: 'food',
        id,
        macros: { carbs: 10, protein: 20, fat: 5 },
      },
    })

  const createGroupItem = (id: number, name: string, children = []) =>
    createUnifiedItem({
      id,
      name,
      quantity: 100,
      reference: {
        type: 'group',
        children,
      },
    })

  it('should validate hierarchy and prevent circular references', () => {
    // Create parent group
    const parentGroup = createGroupItem(1, 'Parent Group')

    // Create child group
    const childGroup = createGroupItem(2, 'Child Group')

    // Add child to parent
    const parentWithChild = addChildToItem(parentGroup, childGroup)

    // Verify this is valid
    expect(validateItemHierarchy(parentWithChild)).toBe(true)

    // Now create a circular reference by adding parentGroup to childGroup's children
    // We need to modify the childGroup within the parentWithChild structure
    const circularStructure = createUnifiedItem({
      id: 1,
      name: 'Parent Group',
      quantity: 100,
      reference: {
        type: 'group',
        children: [
          {
            id: 2,
            name: 'Child Group',
            quantity: 100,
            reference: {
              type: 'group',
              children: [
                {
                  id: 1, // Same ID as parent - creates circular reference
                  name: 'Parent Group',
                  quantity: 100,
                  reference: {
                    type: 'group',
                    children: [],
                  },
                  __type: 'UnifiedItem',
                },
              ],
            },
            __type: 'UnifiedItem',
          },
        ],
      },
    })

    // This should be invalid due to circular reference
    expect(validateItemHierarchy(circularStructure)).toBe(false)
  })

  it('should allow adding food items to groups without circular reference issues', () => {
    const group = createGroupItem(1, 'Test Group')
    const food1 = createFoodItem(2, 'Apple')
    const food2 = createFoodItem(3, 'Banana')

    // Add food items to group
    let updatedGroup = addChildToItem(group, food1)
    updatedGroup = addChildToItem(updatedGroup, food2)

    // Should be valid (no circular references possible with food items)
    expect(validateItemHierarchy(updatedGroup)).toBe(true)
    if (updatedGroup.reference.type === 'group') {
      expect(updatedGroup.reference.children).toHaveLength(2)
    }
  })

  it('should detect circular references in complex hierarchies', () => {
    // Create a structure with circular reference: Group A -> Group B -> Group C -> Group A
    const circularStructure = createUnifiedItem({
      id: 1,
      name: 'Group A',
      quantity: 100,
      reference: {
        type: 'group',
        children: [
          {
            id: 2,
            name: 'Group B',
            quantity: 100,
            reference: {
              type: 'group',
              children: [
                {
                  id: 3,
                  name: 'Group C',
                  quantity: 100,
                  reference: {
                    type: 'group',
                    children: [
                      {
                        id: 1, // Same ID as root - creates circular reference
                        name: 'Group A',
                        quantity: 100,
                        reference: {
                          type: 'group',
                          children: [],
                        },
                        __type: 'UnifiedItem',
                      },
                    ],
                  },
                  __type: 'UnifiedItem',
                },
              ],
            },
            __type: 'UnifiedItem',
          },
        ],
      },
    })

    // This should be invalid due to circular reference
    expect(validateItemHierarchy(circularStructure)).toBe(false)

    // Also test a valid deep hierarchy
    const validStructure = createUnifiedItem({
      id: 1,
      name: 'Group A',
      quantity: 100,
      reference: {
        type: 'group',
        children: [
          {
            id: 2,
            name: 'Group B',
            quantity: 100,
            reference: {
              type: 'group',
              children: [
                {
                  id: 3,
                  name: 'Group C',
                  quantity: 100,
                  reference: {
                    type: 'group',
                    children: [],
                  },
                  __type: 'UnifiedItem',
                },
              ],
            },
            __type: 'UnifiedItem',
          },
        ],
      },
    })

    // This should be valid (no cycles)
    expect(validateItemHierarchy(validStructure)).toBe(true)
  })

  it('should allow deep hierarchies without cycles', () => {
    // Create a deep hierarchy without cycles
    const level1 = createGroupItem(1, 'Level 1')
    const level2 = createGroupItem(2, 'Level 2')
    const level3 = createGroupItem(3, 'Level 3')
    const food = createFoodItem(4, 'Food')

    // Build: Level 1 -> Level 2 -> Level 3 -> Food
    const l3WithFood = addChildToItem(level3, food)
    const l2WithL3 = addChildToItem(level2, l3WithFood)
    const l1WithL2 = addChildToItem(level1, l2WithL3)

    // This should be valid (no cycles)
    expect(validateItemHierarchy(l1WithL2)).toBe(true)
  })

  it('should transform food item to group when pasting into food item', () => {
    // Create a food item
    const [item, setItem] = createSignal(
      createUnifiedItem({
        id: 1,
        name: 'Original Food',
        quantity: 100,
        reference: {
          type: 'food',
          id: 1,
          macros: { carbs: 10, protein: 5, fat: 2, calories: 77 },
        },
      }),
    )

    // Create another food item to paste
    const itemToPaste = createUnifiedItem({
      id: 2,
      name: 'Pasted Food',
      quantity: 50,
      reference: {
        type: 'food',
        id: 2,
        macros: { carbs: 5, protein: 3, fat: 1, calories: 41 },
      },
    })

    // Mock clipboard data
    vi.mocked(useCopyPasteActions).mockReturnValue({
      handleCopy: vi.fn(),
      handlePaste: vi.fn((callback) => {
        callback?.(itemToPaste)
      }),
      hasValidPastableOnClipboard: vi.fn(() => true),
    })

    // Render the component
    render(() => <GroupChildrenEditor item={item} setItem={setItem} />)

    // Find and click the paste button
    const pasteButton = screen.getByRole('button', { name: /paste/i })
    fireEvent.click(pasteButton)

    // Verify that the food item was transformed to a group
    const updatedItem = item()
    expect(updatedItem.reference.type).toBe('group')

    if (updatedItem.reference.type === 'group') {
      const children = updatedItem.reference.children
      expect(children).toHaveLength(2)

      // First child should be the original food (with new ID)
      expect(children[0].name).toBe('Original Food')
      expect(children[0].reference.type).toBe('food')
      expect(children[0].id).not.toBe(1) // Should have new ID

      // Second child should be the pasted food (with new ID)
      expect(children[1].name).toBe('Pasted Food')
      expect(children[1].reference.type).toBe('food')
      expect(children[1].id).not.toBe(2) // Should have new ID
    }
  })

  it('should not transform group/recipe items when pasting', () => {
    // Create a group item
    const [item, setItem] = createSignal(
      createUnifiedItem({
        id: 1,
        name: 'Original Group',
        quantity: 100,
        reference: {
          type: 'group',
          children: [],
        },
      }),
    )

    // Create a food item to paste
    const itemToPaste = createUnifiedItem({
      id: 2,
      name: 'Pasted Food',
      quantity: 50,
      reference: {
        type: 'food',
        id: 2,
        macros: { carbs: 5, protein: 3, fat: 1, calories: 41 },
      },
    })

    // Mock clipboard data
    vi.mocked(useCopyPasteActions).mockReturnValue({
      handleCopy: vi.fn(),
      handlePaste: vi.fn((callback) => {
        callback?.(itemToPaste)
      }),
      hasValidPastableOnClipboard: vi.fn(() => true),
    })

    // Render the component
    render(() => <GroupChildrenEditor item={item} setItem={setItem} />)

    // Find and click the paste button
    const pasteButton = screen.getByRole('button', { name: /paste/i })
    fireEvent.click(pasteButton)

    // Verify that the group item was NOT transformed and just added the child
    const updatedItem = item()
    expect(updatedItem.reference.type).toBe('group')
    expect(updatedItem.id).toBe(1) // Should keep the same ID

    if (updatedItem.reference.type === 'group') {
      const children = updatedItem.reference.children
      expect(children).toHaveLength(1)

      // Should just have the pasted food as child
      expect(children[0].name).toBe('Pasted Food')
      expect(children[0].reference.type).toBe('food')
      expect(children[0].id).not.toBe(2) // Should have new ID
    }
  })
})
