import { deepCopy } from '~/legacy/utils/deepCopy'
import { type Mutable } from '~/legacy/utils/typeUtils'

export abstract class Editor<T extends Omit<TNew, '__type'>, TNew extends object | undefined | null = T> {
  protected readonly content: Mutable<TNew>
  constructor(content: TNew) {
    const copy = deepCopy(content)
    if (copy === null) {
      throw new Error('Error copying recipe!')
    }
    this.content = copy
  }

  replace(content: T | TNew) {
    const copy = deepCopy(content)
    if (copy === null) {
      throw new Error('Error copying recipe!')
    }
    Object.assign(this.content, copy)
    return this
  }

  protected abstract onFinish(): void

  finish() {
    this.onFinish()
    const copy = deepCopy(this.content)

    if (copy === null) {
      throw new Error('Error copying recipe!')
    }

    return copy
  }
}
