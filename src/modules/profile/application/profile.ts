import { createSignal, createEffect } from 'solid-js'
import { type Mutable } from '~/legacy/utils/typeUtils'
import { currentUser } from '~/modules/user/application/user'
import { type User } from '~/modules/user/domain/user'

export type UnsavedFields = { [key in keyof Mutable<User>]?: boolean }
export const [unsavedFields, setUnsavedFields] = createSignal<UnsavedFields>({})
export const [innerData, setInnerData] = createSignal<User | null>(
  currentUser(),
)

// Sync innerData with currentUser when it changes
createEffect(() => {
  setInnerData(currentUser())
})
