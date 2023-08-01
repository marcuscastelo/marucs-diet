'use client'

import { useUser } from '@/redux/features/userSlice'
import PageLoading from '../PageLoading'
import { User, userSchema } from '@/model/userModel'
import TopBar from './TopBar'
import Link from 'next/link'
import { Primitive } from 'zod'
import { SetStateAction, useCallback, useEffect, useState } from 'react'
import { updateUser } from '@/controllers/users'
import MacroTarget, { MacroProfile } from '../MacroTargets'
import Capsule from '../Capsule'

const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

type Translation<T extends string> = { [key in T]: string }

// TODO: Módulo de tradução de enum para string
const DIET_TRANSLATION: Translation<User['diet']> = {
  cut: 'Cutting',
  normo: 'Normocalórica',
  bulk: 'Bulking',
}

// TODO: Módulo de tradução de enum para string
const USER_FIELD_TRANSLATION: Translation<keyof User> = {
  name: 'Nome',
  weight: 'Peso',
  height: 'Altura',
  diet: 'Dieta',
  birthdate: 'Data de Nascimento',
  macro_profile: 'Perfil de Macronutrientes',
  favorite_foods: 'Alimentos Favoritos',
  id: 'ID',
}

export default function Page() {
  const { user, setUser } = useUser()

  const onSetProfile = useCallback(
    async (action: (old: MacroProfile) => MacroProfile) => {
      if (user.loading) {
        return
      }

      const profile = action(user.data.macro_profile)

      const newUser = {
        ...user.data,
        macro_profile: profile,
      }

      // Only update the user if the profile has changed
      // TODO: This is a hack to avoid updating the user when the profile is the same
      if (
        JSON.stringify(
          newUser.macro_profile,
        ) /* TODO: Check if equality is a bug */ ===
        JSON.stringify(user.data.macro_profile)
      ) {
        return
      }

      await updateUser(newUser.id, newUser)
      console.log('Updating user')
      setUser(newUser)
    },
    [user, setUser],
  )

  if (user.loading) {
    return (
      <>
        <TopBar />
        <PageLoading message="Carregando usuário..." />
      </>
    )
  }

  return (
    <>
      <TopBar />

      <div className={`mx-1 sm:mx-40 lg:mx-auto lg:w-1/3`}>
        <BasicInfo />

        <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
          <MacroTarget
            weight={user.data.weight}
            profile={user.data.macro_profile}
            onSaveProfile={(action) => onSetProfile(action)}
          />
        </div>
        <WeightProgress userData={user.data} />
      </div>
    </>
  )
}

function BasicInfo() {
  const { user, setUser, fetchUser } = useUser()
  const [innerData, setInnerData] = useState<User | undefined>(
    user.loading ? undefined : user.data,
  )

  useEffect(() => {
    if (user.loading) {
      return
    }

    setInnerData(user.data)
  }, [user])

  if (user.loading || !innerData) {
    return <CardLoading />
  }

  const makeOnBlur = <T extends keyof User>(
    field: T,
    convert: (value: string) => User[T],
  ) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      const newUser = { ...user.data }

      newUser[field] = convert(event.target.value)
      const updatedUser = await updateUser(newUser.id, newUser)
      setInnerData(updatedUser)
      setUser(updatedUser)
    }
  }

  const makeOnChange = <T extends keyof User>(
    field: T,
    convert: (value: string) => string,
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      const newUser = { ...user.data }

      newUser[field] = convert(event.target.value) as unknown as User[T]
      setInnerData(newUser)
    }
  }

  const convertString = (value: string) => value
  const convertNumber = (value: string) => parseFloat(value) || 0
  const convertDiet = (value: string): User['diet'] =>
    (Object.keys(DIET_TRANSLATION) as User['diet'][]).find(
      (key) => key === /* TODO: Check if equality is a bug */ value,
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
          {user.data.name}
        </h5>

        <div className={`mb-1 mt-3 text-center text-lg italic`}>
          Informações
        </div>
        <div className={`mx-5 lg:mx-20`}>
          {makeBasicCapsule('name', convertString)}
          {makeBasicCapsule('weight', convertNumber, '(kg)')}
          {makeBasicCapsule('height', convertNumber, '(cm)')}
          {makeBasicCapsule('diet', convertDiet)}
          {makeBasicCapsule('birthdate', convertString)}
        </div>
      </div>
      <Link
        className={`btn-primary no-animation btn w-full rounded-t-none`}
        href="/"
      >
        Salvar
      </Link>
    </>
  )
}

function WeightProgress({ userData }: { userData: User }) {
  return (
    <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
        Progresso do peso
      </h5>
      <div className="mx-20">
        <Capsule
          leftContent={<h5 className={`ml-2 p-2 text-xl`}>Peso Atual (kg)</h5>}
          rightContent={<h5 className={`ml-2 p-2 text-xl`}>0</h5>}
          className={`mb-2`}
        />
        <Capsule
          leftContent={<h5 className={`ml-2 p-2 text-xl`}>Meta (kg)</h5>}
          rightContent={<h5 className={`ml-2 p-2 text-xl`}>0</h5>}
          className={`mb-2`}
        />
      </div>
      TODO: Barra de progresso aqui
    </div>
  )
}

const CardLoading = () => (
  <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} rounded-b-none pb-6`}>
    <h5 className={`mx-auto animate-pulse text-center text-3xl font-bold`}>
      Carregando...
    </h5>
  </div>
)
