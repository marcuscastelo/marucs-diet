'use client'

import { User, userSchema } from '@/model/userModel'
import { useEffect, useState } from 'react'
import Capsule from '@/src/sections/common/components/capsule/Capsule'
import { z } from 'zod'
import { CapsuleContent } from '@/src/sections/common/components/capsule/CapsuleContent'
import { UserIcon } from '@/sections/common/components/UserIcon'
import { Mutable } from '@/utils/typeUtils'
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
export function BasicInfo({
  user,
  onSave,
}: {
  user: User
  onSave: (newUser: User) => Promise<User>
}) {
  type UnsavedFields = { [key in keyof Mutable<User>]?: boolean }

  const [innerData, setInnerData] = useState<User>(user)
  const [unsavedFields, setUnsavedFields] = useState<UnsavedFields>({})

  useEffect(() => {
    setInnerData(user)
  }, [user])

  useEffect(() => {
    setUnsavedFields(
      Object.keys(innerData).reduce((acc, key) => {
        acc[key as keyof UnsavedFields] =
          innerData[key as keyof UnsavedFields] !== user[key as keyof User]
        return acc
      }, {} as UnsavedFields),
    )
  }, [innerData, user])

  const makeOnBlur = <T extends keyof User>(
    field: T,
    convert: (value: string) => User[T],
  ) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      const newUser = { ...user }

      newUser[field] = convert(event.target.value)

      // TODO: Move to server onSave(newProfile)
      setInnerData(userSchema.parse(newUser))
    }
  }

  const makeOnChange = <T extends keyof User>(
    field: T,
    convert: (value: string) => string,
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      const newUser = { ...user }

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
    (Object.keys(DIET_TRANSLATION) as User['diet'][]).find(
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
            className={`pl-5 text-xl ${
              unsavedFields[field] ? 'text-red-500 italic' : ''
            }`}
          >
            {USER_FIELD_TRANSLATION[field]} {extra}{' '}
            {unsavedFields[field] ? '*' : ''}
          </h5>
        </CapsuleContent>
      }
      rightContent={
        <CapsuleContent>
          <input
            className={`btn-ghost input px-0 pl-5 text-xl`}
            value={innerData[field].toString()}
            onChange={makeOnChange(field, convertString)}
            onBlur={makeOnBlur(field, convert)}
            style={{ width: '100%' }}
          />
        </CapsuleContent>
      }
      className={`mb-2`}
    />
  )
  return (
    <>
      <div
        className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} rounded-b-none pb-6`}
      >
        <h5 className={`mx-auto text-center text-3xl font-bold`}>
          <UserIcon userId={user.id} className={`w-32 h-32 mx-auto`} />
          {user.name}
        </h5>

        <div className={`mb-1 mt-3 text-center text-lg italic`}>
          Informações
        </div>
        <div className={`mx-5 lg:mx-20`}>
          {makeBasicCapsule('name', convertString)}
          {makeBasicCapsule('gender', convertGender)}
          {makeBasicCapsule('diet', convertDiet)}
          {makeBasicCapsule('birthdate', convertString)}
          {makeBasicCapsule('desired_weight', convertDesiredWeight)}
        </div>
      </div>
      <button
        className={`btn-primary no-animation btn w-full rounded-t-none`}
        onClick={async () => await onSave(innerData)}
      >
        Salvar
      </button>
    </>
  )
}
