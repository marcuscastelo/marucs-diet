import { deepCopy } from '../deepCopy'
import { Mutable } from '../typeUtils'

export abstract class Editor<T extends object | undefined | null> {
  protected readonly content: Mutable<T>
  constructor(content: T) {
    const copy = deepCopy(content)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    this.content = copy
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
