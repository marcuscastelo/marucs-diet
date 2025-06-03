import {
  createSignal,
  type Accessor,
  type Setter,
  createEffect,
} from 'solid-js'

// TODO: Remove mirror signals in the future
/**
 * @deprecated Mirror signals are a temporary solution and should be avoided.
 */
export function createMirrorSignal<T>(
  inputSignal: Accessor<T>,
): [Accessor<T>, Setter<T>] {
  const [outputSignal, setOutputSignal] = createSignal<T>(inputSignal())

  createEffect(() => {
    setOutputSignal(() => inputSignal())
  })

  return [outputSignal, setOutputSignal]
}
