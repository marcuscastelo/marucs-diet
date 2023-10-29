'use client'

import { BasicInfo } from '@/sections/profile/components/BasicInfo'
import { WeightEvolution } from '@/sections/weight/components/WeightEvolution'
import { MeasuresEvolution } from '@/sections/profile/components/measure/MeasuresEvolution'

import { MacroTarget } from '@/src/sections/macro-nutrients/components/MacroTargets'
import { revalidatePath } from 'next/cache'
import { MacroEvolution } from '@/sections/macro-profile/components/MacroEvolution'
import { latestWeight } from '@/legacy/utils/weightUtils'
import { User } from '@/modules/user/domain/user'
import { MacroProfile } from '@/src/modules/diet/macro-profile/domain/macroProfile'
import {
  insertMacroProfile,
  updateMacroProfile,
} from '@/legacy/controllers/macroProfiles'
import { latestMacroProfile } from '@/legacy/utils/macroProfileUtils'
import { getToday } from '@/legacy/utils/dateUtils'
import { BottomNavigation } from '@/sections/common/components/BottomNavigation'
import {
  currentUser,
  currentUserId,
  updateUser,
} from '@/src/modules/user/application/user'
import { useWeightContext } from '@/src/sections/weight/context/WeightContext'
import { useMacroProfiles } from '@/src/sections/macro-profile/hooks/useMacroProfiles'
import PageLoading from '@/src/sections/common/components/PageLoading'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export const revalidate = 1
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function Page() {
  const { weights } = useWeightContext()
  const { macroProfiles } = useMacroProfiles(currentUserId.value ?? 3)

  if (currentUserId.value === null) {
    console.error('[ProfilePage] User not defined')
    throw new Error('User not defined')
  }

  if (weights.loading || weights.errored) {
    return <PageLoading message="Carregando pesos" />
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <PageLoading message="Carregando perfis de macro" />
  }

  const weight = latestWeight(weights.data)?.weight

  const macroProfile = latestMacroProfile(macroProfiles.data)

  if (!macroProfile) {
    if (currentUserId.value === null) {
      console.error('[ProfilePage] User not defined')
      throw new Error('User not defined')
    }
    insertMacroProfile({
      owner: currentUserId.value,
      target_day: new Date(Date.now()),
      gramsPerKgCarbs: 2,
      gramsPerKgProtein: 2,
      gramsPerKgFat: 1,
    }).then(() => {
      revalidatePath('/')
    })
    return (
      <>
        <h1>
          Usuário &apos;{currentUserId}&apos; não possui perfis de macro
          registrados, criando perfil padrão...
        </h1>
      </>
    )
  }

  const handleSave = async () => {
    alert('TODO: handleSave Ainda não implementado')
  }

  const onSaveProfile = async (profile: MacroProfile) => {
    if (profile.target_day.getTime() > new Date(getToday()).getTime()) {
      console.error(
        `[ProfilePage] Invalid target day ${profile.target_day}: it is in the future`,
      )
      throw new Error('Invalid target day')
    } else if (
      profile.target_day.getTime() === new Date(getToday()).getTime()
    ) {
      // Same day, update
      await updateMacroProfile(profile.id, profile)
    } else if (profile.target_day.getTime() < new Date(getToday()).getTime()) {
      // Past day, insert with new date
      await insertMacroProfile({
        ...profile,
        target_day: new Date(getToday()),
      })
    }
    console.log('Updating MacroProfile')
    alert('TODO: onSaveProfile Ainda não implementado')
  }

  console.debug(`[ProfilePage] Rendering profile`)

  if (currentUser.value === null) {
    return <div>Usuário não encontrado para o id {currentUserId.value}</div>
  }

  return (
    <>
      <div className={`mx-1 md:mx-40 lg:mx-auto lg:w-1/3`}>
        <BasicInfo
          user={currentUser.value}
          onSave={async (newUser: User) => {
            const updatedUser = await updateUser(newUser.id, newUser)
            alert('TODO: onSave Ainda não implementado')
            return updatedUser
          }}
        />

        <WeightEvolution onSave={handleSave} />
        <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
          {weight !== undefined ? (
            <MacroTarget
              weight={weight}
              profiles={macroProfiles.data}
              onSaveMacroProfile={onSaveProfile}
              mode="edit"
            />
          ) : (
            <h1>Não há pesos registrados, o perfil não pode ser calculado</h1>
          )}
        </div>
        <MacroEvolution />
        <MeasuresEvolution onSave={handleSave} />
      </div>
      <BottomNavigation />
    </>
  )
}
