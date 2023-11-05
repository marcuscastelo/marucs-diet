import { Editor } from '@/legacy/utils/data/editor'
import { deepCopy } from '@/legacy/utils/deepCopy'
import { type Mutable } from '@/legacy/utils/typeUtils'
import { type Meal } from '@/modules/diet/meal/domain/meal'
import { type ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { ItemGroupEditor } from '@/legacy/utils/data/itemGroupEditor'

export class MealEditor extends Editor<Meal> {
  private readonly meal = this.content

  setName(name: string) {
    this.meal.name = name
    return this
  }

  addGroup(group: ItemGroup) {
    this.meal.groups.push(deepCopy(group) as Mutable<ItemGroup>)
    return this
  }

  addGroups(groups: readonly ItemGroup[]) {
    this.meal.groups.push(
      ...(groups.map(deepCopy) as Array<Mutable<ItemGroup>>),
    )
    return this
  }

  findGroup(id: ItemGroup['id']) {
    return this.meal.groups.find((item) => item.id === id)
  }

  editGroup(
    id: ItemGroup['id'],
    callback: (editor: Omit<ItemGroupEditor, 'finish'> | undefined) => void,
  ) {
    const group = this.findGroup(id)
    const editor = group !== undefined ? new ItemGroupEditor(group) : undefined
    callback(editor)
    const newItem = editor?.finish()
    if (newItem !== undefined) {
      const index = this.meal.groups.findIndex((group) => group.id === id)
      this.meal.groups.splice(index, 1, newItem)
    }
    return this
  }
  // editItems (
  //   callback: (
  //     id: number,
  //     editor: Omit<ItemEditor, 'finish'> | undefined,
  //   ) => void
  // ) {
  //   for (const item of this.meal.groups) {
  //     const editor = new ItemEditor(item)
  //     callback(item.id, editor)
  //     const newItem = editor.finish()
  //     const index = this.meal.groups.findIndex((i) => i.id === item.id)
  //     this.meal.groups.splice(index, 1, newItem)
  //   }
  //   return this
  // }

  setGroups(groups: ItemGroup[]) {
    this.meal.groups = deepCopy(groups) as Array<Mutable<ItemGroup>>
    return this
  }

  deleteGroup(id: ItemGroup['id']) {
    const index = this.meal.groups.findIndex((group) => group.id === id)
    if (index === -1) {
      console.warn(`Item with id ${id} not found!`)
      return this
    }
    this.meal.groups.splice(index, 1)
    return this
  }

  clearGroups() {
    this.meal.groups = []
    return this
  }

  protected override onFinish() {}
}
