import { Show } from 'solid-js'
import { type Mutable } from '~/legacy/utils/typeUtils'
import {
  innerData,
  setInnerData,
  unsavedFields,
} from '~/modules/profile/application/profile'
import { userSchema, type User } from '~/modules/user/domain/user'
import { Capsule } from '~/sections/common/components/capsule/Capsule'
import { CapsuleContent } from '~/sections/common/components/capsule/CapsuleContent'

type Translation<T extends string> = { [key in T]: string }

const makeOnChange = <T extends keyof User>(
  field: T,
  convert: (value: string) => string,
) => {
  return (
    event: Event & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    },
  ) => {
    event.preventDefault()

    const innerData_ = innerData()

    if (innerData_ === null) {
      return
    }

    const newUser: Mutable<User> = { ...innerData_ }

    newUser[field] = convert(event.target.value) as unknown as User[T]
    setInnerData(newUser)
  }
}

const makeOnBlur = <T extends keyof User>(
  field: T,
  convert: (value: string) => User[T],
) => {
  return (
    event: FocusEvent & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    },
  ) => {
    event.preventDefault()

    const innerData_ = innerData()

    if (innerData_ === null) {
      return
    }

    const newUser: Mutable<User> = { ...innerData_ }

    newUser[field] = convert(event.target.value)

    // TODO: Move to server onSave(newProfile)
    setInnerData(userSchema.parse(newUser))
  }
}

export const convertString = (value: string) => value

// TODO: Create module for translations
const USER_FIELD_TRANSLATION: Translation<keyof Omit<User, '__type'>> = {
  name: 'Nome',
  gender: 'Gênero',
  diet: 'Dieta',
  birthdate: 'Data de Nascimento',
  favorite_foods: 'Alimentos Favoritos',
  id: 'ID',
  desired_weight: 'Peso Alvo',
}

export function UserInfoCapsule<T extends keyof Omit<User, '__type'>>(props: {
  field: T
  convert: (value: string) => User[T]
  extra?: string
}) {
  return (
    <Capsule
      leftContent={<LeftContent {...props} />}
      rightContent={<RightContent {...props} />}
      class="mb-2"
    />
  )
}

function LeftContent(props: {
  field: keyof Omit<User, '__type'>
  extra?: string
}) {
  return (
    <CapsuleContent>
      <h5
        class={`pl-5 text-xl ${
          unsavedFields()[props.field] === true ? 'text-red-500 italic' : ''
        }`}
      >
        {USER_FIELD_TRANSLATION[props.field]} {props.extra}{' '}
        {unsavedFields()[props.field] === true ? '*' : ''}
      </h5>
    </CapsuleContent>
  )
}

function RightContent<T extends keyof Omit<User, '__type'>>(props: {
  field: T
  convert: (value: string) => User[T]
}) {
  return (
    <CapsuleContent>
      <Show when={innerData()}>
        {(innerData) => (
          <input
            class={'btn-ghost input px-0 pl-5 text-xl'}
            value={innerData()[props.field].toString()}
            onChange={makeOnChange(props.field, convertString)}
            onBlur={makeOnBlur(props.field, props.convert)}
            style={{ width: '100%' }}
          />
        )}
      </Show>
    </CapsuleContent>
  )
}
