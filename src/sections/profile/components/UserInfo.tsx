import { type User, userSchema } from '~/modules/user/domain/user'
import { UserIcon } from '~/sections/common/components/icons/UserIcon'
import { createEffect, Show } from 'solid-js'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import {
  innerData,
  setUnsavedFields,
  type UnsavedFields,
} from '~/modules/profile/application/profile'
import { currentUser, updateUser } from '~/modules/user/application/user'
import { convertString, UserInfoCapsule } from './UserInfoCapsule'
import { showError } from '~/shared/toast'
import { formatError } from '~/shared/formatError'
import { handleApiError } from '~/shared/error/errorHandler'
type Translation<T extends string> = { [_key in T]: string }
// TODO:   Create module for translations
// TODO:   Make diet translations appear in the UI
// TODO:   Make select input for diet (cut, normo, bulk)
const DIET_TRANSLATION: Translation<User['diet']> = {
  cut: 'Cutting',
  normo: 'Normocalórica',
  bulk: 'Bulking',
}

export function UserInfo() {
  createEffect(() => {
    const user_ = currentUser()
    const innerData_ = innerData()

    if (user_ === null) {
      return
    }

    if (innerData_ === null) {
      return
    }

    const reduceFunc = (acc: UnsavedFields, key: string) => {
      acc[key as keyof UnsavedFields] =
        innerData_[key as keyof UnsavedFields] !== user_[key as keyof User]
      return acc
    }

    setUnsavedFields(
      Object.keys(innerData_).reduce<UnsavedFields>(
        reduceFunc,
        {} satisfies UnsavedFields,
      ),
    )
  })

  const convertDesiredWeight = (value: string) => Number(value)

  const convertGender = (value: string): User['gender'] => {
    const result = userSchema._def.shape().gender.safeParse(value)
    if (!result.success) {
      return 'male'
    }
    return result.data
  }

  const convertDiet = (value: string): User['diet'] =>
    (Object.keys(DIET_TRANSLATION) as Array<User['diet']>).find(
      (key) => key === value,
    ) ?? 'normo'

  return (
    <>
      <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} rounded-b-none pb-6`}>
        <h1 class={'mx-auto text-center text-3xl font-bold'}>
          <Show when={currentUser()}>
            {(user) => (
              <>
                <UserIcon userId={user().id} class={'w-32 h-32 mx-auto'} />
                {user().name}
              </>
            )}
          </Show>
        </h1>

        <div class={'mb-1 mt-3 text-center text-lg italic'}>Informações</div>
        <div class={'mx-5 lg:mx-20'}>
          <UserInfoCapsule field="name" convert={convertString} />
          <UserInfoCapsule field="gender" convert={convertGender} />
          <UserInfoCapsule field="diet" convert={convertDiet} />
          <UserInfoCapsule field="birthdate" convert={convertString} />
          <UserInfoCapsule
            field="desired_weight"
            convert={convertDesiredWeight}
          />
        </div>
      </div>
      <button
        class={'btn-primary no-animation btn w-full rounded-t-none'}
        onClick={() => {
          const user = innerData()
          if (user === null) {
            return
          }
          // Convert User to NewUser for the update
          const newUser = {
            name: user.name,
            favorite_foods: user.favorite_foods,
            diet: user.diet,
            birthdate: user.birthdate,
            gender: user.gender,
            desired_weight: user.desired_weight,
            __type: 'NewUser' as const,
          }
          updateUser(user.id, newUser).catch((error) => {
            handleApiError(error, {
              component: 'UserInfo',
              operation: 'updateUser',
              additionalData: { userId: user.id },
            })
            showError(
              `Erro ao atualizar usuário: ${formatError(error)}`,
              'user-action',
            )
          })
        }}
      >
        Salvar
      </button>
    </>
  )
}
