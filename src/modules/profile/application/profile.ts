import { createSignal } from 'solid-js'
import { type Mutable } from '~/legacy/utils/typeUtils'
import { currentUser } from '~/modules/user/application/user'
import { type User } from '~/modules/user/domain/user'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'

export type UnsavedFields = { [key in keyof Mutable<User>]?: boolean }
export const [unsavedFields, setUnsavedFields] = createSignal<UnsavedFields>({})
export const [innerData, setInnerData] = createMirrorSignal(currentUser)
