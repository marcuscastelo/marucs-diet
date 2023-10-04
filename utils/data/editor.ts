import { deepCopy } from '../deepCopy'

export abstract class Editor<T extends object | undefined | null> {
  protected readonly content: T
  constructor(content: T) {
    const copy = deepCopy(content)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    this.content = copy
  }

  protected abstract beforeFinish(): void
  protected abstract afterFinish(contentCopy: T): void

  finish() {
    this.beforeFinish()
    const copy = deepCopy(this.content)

    if (!copy) {
      throw new Error('Error copying recipe!')
    }

    this.afterFinish(copy)
    return copy
  }
}
