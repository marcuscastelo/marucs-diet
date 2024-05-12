import {
  createSignal,
  type Accessor,
  type Setter,
  createEffect,
} from 'solid-js'

export function createMirrorSignal<T>(
  inputSignal: Accessor<T>,
): [Accessor<T>, Setter<T>] {
  const [outputSignal, setOutputSignal] = createSignal<T>(inputSignal())

  createEffect(() => {
    setOutputSignal(() => inputSignal())
  })

  return [outputSignal, setOutputSignal]
}
