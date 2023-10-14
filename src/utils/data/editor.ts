import { deepCopy } from '@/utils/deepCopy'
import { Mutable } from '@/utils/typeUtils'

export abstract class Editor<T extends object | undefined | null> {
  protected readonly content: Mutable<T>
  constructor(content: T) {
    const copy = deepCopy(content)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    this.content = copy
  }

  replace(content: T) {
    const copy = deepCopy(content)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    Object.assign(this.content, copy)
    return this
  }

  protected abstract onFinish(): void

  finish() {
    this.onFinish()
    const copy = deepCopy(this.content)

    if (!copy) {
      throw new Error('Error copying recipe!')
    }

    return copy
  }
}
