import { BasicInfo } from '~/sections/profile/components/BasicInfo'
import { WeightEvolution } from '~/sections/weight/components/WeightEvolution'
import { MeasuresEvolution } from '~/sections/profile/measure/components/MeasuresEvolution'

import { MacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'
import { MacroEvolution } from '~/sections/macro-profile/components/MacroEvolution'
import { latestWeight } from '~/legacy/utils/weightUtils'
import { type User } from '~/modules/user/domain/user'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'

import { getToday } from '~/legacy/utils/dateUtils'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { currentUser, updateUser } from '~/modules/user/application/user'
import { userWeights } from '~/modules/weight/application/weight'
import {
  insertMacroProfile,
  updateMacroProfile,
  userMacroProfiles,
} from '~/modules/diet/macro-profile/application/macroProfile'
import { Show } from 'solid-js'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export default function Page() {
  // TODO: latestWeight should be a signal
  const weight = () => latestWeight(userWeights())?.weight

  // if (!macroProfile) {
  //   if (currentUserId.value === null) {
  //     console.error('[ProfilePage] User not defined')
  //     throw new Error('User not defined')
  //   }
  //   insertMacroProfile({
  //     owner: currentUserId.value,
  //     target_day: new Date(Date.now()),
  //     gramsPerKgCarbs: 2,
  //     gramsPerKgProtein: 2,
  //     gramsPerKgFat: 1
  //   }).then(() => {
  //     // revalidatePath('/')
  //   })
  //   return (
  //     <>
  //       <h1>
  //         Usuário &apos;{currentUserId.value}&apos; não possui perfis de macro
  //         registrados, criando perfil padrão...
  //       </h1>
  //     </>
  //   )
  // }

  const handleSave = async () => {
    alert('TODO: handleSave Ainda não implementado')
  }

  const onSaveProfile = async (profile: MacroProfile) => {
    if (profile.target_day.getTime() > new Date(getToday()).getTime()) {
      console.error(
        `[ProfilePage] Invalid target day ${profile.target_day.toString()}: it is in the future`,
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

  console.debug('[ProfilePage] Rendering profile')

  return (
    <Show when={currentUser()}>
      {(currentUser) => (
        <>
          <div class={'mx-1 md:mx-40 lg:mx-auto lg:w-1/3'}>
            <BasicInfo
              user={currentUser}
              onSave={async (newUser: User) => {
                const updatedUser = await updateUser(newUser.id, newUser)
                alert('TODO: onSave Ainda não implementado')
                return updatedUser
              }}
            />

            <WeightEvolution
              onSave={() => {
                handleSave().catch((error) => {
                  console.error(error)
                  alert('Erro ao salvar peso') // TODO: Change all alerts with ConfirmModal
                })
              }}
            />
            <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
              <Show
                when={weight()}
                fallback={
                  <h1>
                    Não há pesos registrados, o perfil não pode ser calculado
                  </h1>
                }
              >
                {(weight) => (
                  <MacroTarget
                    weight={weight()}
                    profiles={userMacroProfiles()}
                    onSaveMacroProfile={(profile) => {
                      onSaveProfile(profile).catch((error) => {
                        console.error(error)
                        alert('Erro ao salvar perfil') // TODO: Change all alerts with ConfirmModal
                      })
                    }}
                    mode="edit"
                  />
                )}
              </Show>
            </div>
            <MacroEvolution />
            <MeasuresEvolution
              onSave={() => {
                handleSave().catch((error) => {
                  console.error(error)
                  alert('Erro ao salvar medidas') // TODO: Change all alerts with ConfirmModal
                })
              }}
            />
          </div>
          <BottomNavigation />
        </>
      )}
    </Show>
  )
}
