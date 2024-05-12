import { describe, expect, it, vi } from 'vitest'
import { ItemGroupEditor } from '~/legacy/utils/data/itemGroupEditor'
import { type FoodItem } from '~/modules/diet/food-item/domain/foodItem'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'

function mockItem(): FoodItem {
  return {
    name: 'test:name',
    reference: 1,
    macros: {
      carbs: 10,
      fat: 20,
      protein: 30,
    },
    __type: 'FoodItem',
    id: 1000,
    quantity: 11234,
  }
}

function mockGroup(): ItemGroup {
  return {
    name: 'test:name',
    items: [],
    type: 'simple',
    id: 1000,
    quantity: 0,
  }
}

describe('ItemGroupEditor', () => {
  it('should give the same item if no changes were made', () => {
    expect(new ItemGroupEditor(mockGroup()).finish()).toEqual(mockGroup())
  })

  describe('setName', () => {
    it('should set name', () => {
      expect(
        new ItemGroupEditor(mockGroup()).setName('expect:name').finish(),
      ).toHaveProperty('name', 'expect:name')
    })
  })

  describe('setRecipe', () => {
    it('should set recipe to number', () => {
      const edited = new ItemGroupEditor(mockGroup()).setRecipe(101010).finish()
      expect(edited).toHaveProperty('recipe', 101010)
    })

    it('should change type to recipe', () => {
      const edited = new ItemGroupEditor(mockGroup()).setRecipe(101010).finish()
      expect(edited).toHaveProperty('type', 'recipe')
    })

    it('should set recipe to undefined', () => {
      const edited = new ItemGroupEditor(mockGroup())
        .setRecipe(undefined)
        .finish()
      expect(edited).not.toHaveProperty('recipe')
    })

    it('should change type to simple', () => {
      const edited = new ItemGroupEditor(mockGroup())
        .setRecipe(undefined)
        .finish()
      expect(edited).toHaveProperty('type', 'simple')
    })
  })

  describe('addItem', () => {
    it('should add item when empty', () => {
      const edited = new ItemGroupEditor(mockGroup())
        .addItem(mockItem())
        .finish()

      expect(edited).toHaveProperty('items', [mockItem()])
    })

    it('should add item when not empty', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem()],
      }
      const edited = new ItemGroupEditor(group).addItem(mockItem()).finish()

      expect(edited).toHaveProperty('items', [mockItem(), mockItem()])
    })
  })

  describe('addItems', () => {
    it('should add items when empty', () => {
      const edited = new ItemGroupEditor(mockGroup())
        .addItems([mockItem(), mockItem()])
        .finish()

      expect(edited).toHaveProperty('items', [mockItem(), mockItem()])
    })

    it('should add items when not empty', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem()],
      }
      const edited = new ItemGroupEditor(group)
        .addItems([mockItem(), mockItem()])
        .finish()

      expect(edited).toHaveProperty('items', [
        mockItem(),
        mockItem(),
        mockItem(),
      ])
    })
  })

  describe('findItem', () => {
    it('should not find item when empty', () => {
      const edited = new ItemGroupEditor(mockGroup()).findItem(1000)

      expect(edited).toBeUndefined()
    })

    it('should find item when exactly single item list matches', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem()],
      }
      const edited = new ItemGroupEditor(group).findItem(1000)

      expect(edited).toEqual(mockItem())
    })

    it('should not find item when exactly single item list does not match', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem()],
      }
      const edited = new ItemGroupEditor(group).findItem(1001)

      expect(edited).toBeUndefined()
    })

    it('should find item when multiple items list matches', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem(), mockItem()],
      }
      const edited = new ItemGroupEditor(group).findItem(1000)

      expect(edited).toEqual(mockItem())
    })

    it('should not find item when multiple items list does not match', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem(), mockItem()],
      }
      const edited = new ItemGroupEditor(group).findItem(1001)

      expect(edited).toBeUndefined()
    })

    it('should find item when multiple items list matches first, but not second', () => {
      const group = {
        ...mockGroup(),
        items: [mockItem(), { ...mockItem(), id: 0 }],
      }
      const edited = new ItemGroupEditor(group).findItem(1000)

      expect(edited).toEqual(mockItem())
    })

    it('should find item when multiple items list matches second, but not first', () => {
      const group = {
        ...mockGroup(),
        items: [{ ...mockItem(), id: 0 }, mockItem()],
      }
      const edited = new ItemGroupEditor(group).findItem(1000)

      expect(edited).toEqual(mockItem())
    })
  })

  describe('editItem', () => {
    it('should call callback with undefined when item not found', () => {
      const callback = vi.fn()
      new ItemGroupEditor(mockGroup()).editItem(1000, callback).finish()

      expect(callback).toHaveBeenCalledWith(undefined)
    })

    it('should call callback with editor when item found', () => {
      const callback = vi.fn()
      const group = {
        ...mockGroup(),
        items: [mockItem()],
      }
      new ItemGroupEditor(group).editItem(1000, callback).finish()

      expect(callback).toHaveBeenCalledWith(expect.anything())
    })
  })
})
