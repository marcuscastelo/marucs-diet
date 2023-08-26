'use client'

import { User } from '@/model/userModel'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { updateUser } from '@/controllers/users'
import Capsule from '../../components/capsule/Capsule'
type Translation<T extends string> = { [key in T]: string }
// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'
// TODO: Create module for translations
const DIET_TRANSLATION: Translation<User['diet']> = {
  cut: 'Cutting',
  normo: 'Normocalórica',
  bulk: 'Bulking',
}

// TODO: Create module for translations
const USER_FIELD_TRANSLATION: Translation<keyof User> = {
  name: 'Nome',
  diet: 'Dieta',
  birthdate: 'Data de Nascimento',
  macro_profile: 'Perfil de Macronutrientes',
  favorite_foods: 'Alimentos Favoritos',
  id: 'ID',
}
export default function BasicInfo({
  user,
  onSave,
}: {
  user: User
  onSave: () => void
}) {
  const [innerData, setInnerData] = useState<User>(user)

  useEffect(() => {
    setInnerData(user)
  }, [user])

  const makeOnBlur = <T extends keyof User>(
    field: T,
    convert: (value: string) => User[T],
  ) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      const newUser = { ...user }

      newUser[field] = convert(event.target.value)
      // TODO: Only save user profile with save button
      // TODO: Move to server onSave(newProfile)
      const updatedUser = await updateUser(newUser.id, newUser)
      setInnerData(updatedUser)
      // TODO: Only save user profile with save button
      onSave()
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
        <h5 className={`pl-5 text-xl`}>
          {USER_FIELD_TRANSLATION[field]} {extra}
        </h5>
      }
      rightContent={
        <input
          className={`btn-ghost input px-0 pl-5 text-xl`}
          value={innerData[field].toString()}
          onChange={makeOnChange(field, convertString)}
          onBlur={makeOnBlur(field, convert)}
          style={{ width: '100%' }}
        />
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
          {user.name}
        </h5>

        <div className={`mb-1 mt-3 text-center text-lg italic`}>
          Informações
        </div>
        <div className={`mx-5 lg:mx-20`}>
          {makeBasicCapsule('name', convertString)}
          {makeBasicCapsule('diet', convertDiet)}
          {makeBasicCapsule('birthdate', convertString)}
        </div>
      </div>
      <Link
        className={`btn-primary no-animation btn w-full rounded-t-none`}
        href="/"
        onClick={() => onSave()}
      >
        Salvar
      </Link>
    </>
  )
}
