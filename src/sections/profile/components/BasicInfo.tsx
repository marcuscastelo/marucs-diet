import { type User, userSchema } from '@/modules/user/domain/user'
import { Capsule } from '@/sections/common/components/capsule/Capsule'
import { type z } from 'zod'
import { CapsuleContent } from '@/sections/common/components/capsule/CapsuleContent'
import { UserIcon } from '@/sections/common/components/UserIcon'
import { type Mutable } from '@/legacy/utils/typeUtils'
import { type Accessor, createEffect, createSignal } from 'solid-js'
type Translation<T extends string> = { [key in T]: string }
// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'
// TODO: Create module for translations
// TODO: Make diet translations appear in the UI
// TODO: Make select input for diet (cut, normo, bulk)
const DIET_TRANSLATION: Translation<User['diet']> = {
  cut: 'Cutting',
  normo: 'Normocalórica',
  bulk: 'Bulking',
}

// TODO: Create module for translations
const USER_FIELD_TRANSLATION: Translation<keyof User> = {
  name: 'Nome',
  gender: 'Gênero',
  diet: 'Dieta',
  birthdate: 'Data de Nascimento',
  favorite_foods: 'Alimentos Favoritos',
  id: 'ID',
  desired_weight: 'Peso Alvo',
}
export function BasicInfo(props: {
  user: Accessor<User>
  onSave: (newUser: User) => Promise<User>
}) {
  type UnsavedFields = { [key in keyof Mutable<User>]?: boolean }

  const [innerData, setInnerData] = createSignal<User>(props.user())
  const [unsavedFields, setUnsavedFields] = createSignal<UnsavedFields>({})

  createEffect(() => {
    setInnerData(props.user())
  })

  createEffect(() => {
    const reduceFunc = (acc: UnsavedFields, key: string) => {
      acc[key as keyof UnsavedFields] =
        innerData()[key as keyof UnsavedFields] !==
        props.user()[key as keyof User]
      return acc
    }

    setUnsavedFields(
      Object.keys(innerData).reduce<UnsavedFields>(
        reduceFunc,
        {} satisfies UnsavedFields,
      ),
    )
  })

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
      const newUser: Mutable<User> = { ...props.user() }

      newUser[field] = convert(event.target.value)

      // TODO: Move to server onSave(newProfile)
      setInnerData(userSchema.parse(newUser))
    }
  }

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
      const newUser: Mutable<User> = { ...props.user() }

      newUser[field] = convert(event.target.value) as unknown as User[T]
      setInnerData(newUser)
    }
  }

  const convertString = (value: string) => value
  const convertDesiredWeight = (value: string) => Number(value)
  const makeLiteralConverter =
    <T extends z.ZodUnion<any>>(schema: T, defaultValue: z.infer<T>) =>
    (value: string): z.infer<T> => {
      const result = schema.safeParse(value)
      if (!result.success) {
        return defaultValue
      }
      return result.data
    }

  const convertGender = makeLiteralConverter(
    userSchema._def.shape().gender,
    'male',
  )

  const convertDiet = (value: string): User['diet'] =>
    (Object.keys(DIET_TRANSLATION) as Array<User['diet']>).find(
      (key) => key === value,
    ) ?? 'normo'

  const makeBasicCapsule = <T extends keyof User>(
    field: T,
    convert: (value: string) => User[T],
    extra?: string,
  ) => (
    <Capsule
      leftContent={
        <CapsuleContent>
          <h5
            class={`pl-5 text-xl ${
              unsavedFields()[field] ? 'text-red-500 italic' : ''
            }`}
          >
            {USER_FIELD_TRANSLATION[field]} {extra}{' '}
            {unsavedFields()[field] ? '*' : ''}
          </h5>
        </CapsuleContent>
      }
      rightContent={
        <CapsuleContent>
          <input
            class={'btn-ghost input px-0 pl-5 text-xl'}
            value={innerData()[field].toString()}
            onChange={makeOnChange(field, convertString)}
            onBlur={makeOnBlur(field, convert)}
            style={{ width: '100%' }}
          />
        </CapsuleContent>
      }
      class={'mb-2'}
    />
  )
  return (
    <>
      <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} rounded-b-none pb-6`}>
        <h5 class={'mx-auto text-center text-3xl font-bold'}>
          <UserIcon userId={props.user().id} class={'w-32 h-32 mx-auto'} />
          {props.user.name}
        </h5>

        <div class={'mb-1 mt-3 text-center text-lg italic'}>Informações</div>
        <div class={'mx-5 lg:mx-20'}>
          {makeBasicCapsule('name', convertString)}
          {makeBasicCapsule('gender', convertGender)}
          {makeBasicCapsule('diet', convertDiet)}
          {makeBasicCapsule('birthdate', convertString)}
          {makeBasicCapsule('desired_weight', convertDesiredWeight)}
        </div>
      </div>
      <button
        class={'btn-primary no-animation btn w-full rounded-t-none'}
        onClick={() => {
          props.onSave(innerData()).catch(console.error)
        }}
      >
        Salvar
      </button>
    </>
  )
}
