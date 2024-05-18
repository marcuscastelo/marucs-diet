import { BasicInfo } from '~/sections/profile/components/BasicInfo'
import { WeightEvolution } from '~/sections/weight/components/WeightEvolution'
import { MeasuresEvolution } from '~/sections/profile/measure/components/MeasuresEvolution'

import { MacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'
import { MacroEvolution } from '~/sections/macro-profile/components/MacroEvolution'
import { latestWeight } from '~/legacy/utils/weightUtils'
import { type User } from '~/modules/user/domain/user'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'

import { getTodayYYYMMDD } from '~/legacy/utils/dateUtils'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { currentUser, updateUser } from '~/modules/user/application/user'
import { userWeights } from '~/modules/weight/application/weight'
import {
  insertMacroProfile,
  updateMacroProfile,
  userMacroProfiles,
} from '~/modules/diet/macro-profile/application/macroProfile'
import { type JSXElement, Show } from 'solid-js'
import { ConfirmModalProvider } from '~/sections/common/context/ConfirmModalContext'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'
import toast, { Toaster } from 'solid-toast'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export default function Page() {
  // TODO: latestWeight should be a signal
  const weight = () => latestWeight(userWeights())?.weight

  const onSaveProfile = async (profile: MacroProfile) => {
    if (profile.target_day.getTime() > new Date(getTodayYYYMMDD()).getTime()) {
      console.error(
        `[ProfilePage] Invalid target day ${profile.target_day.toString()}: it is in the future`,
      )
      throw new Error('Invalid target day')
    } else if (
      profile.target_day.getTime() === new Date(getTodayYYYMMDD()).getTime()
    ) {
      // Same day, update
      await updateMacroProfile(profile.id, profile)
    } else if (
      profile.target_day.getTime() < new Date(getTodayYYYMMDD()).getTime()
    ) {
      // Past day, insert with new date
      await insertMacroProfile({
        ...profile,
        target_day: new Date(getTodayYYYMMDD()),
      })
    }
    console.log('Updating MacroProfile')
  }

  console.debug('[ProfilePage] Rendering profile')

  return (
    <Providers>
      <Show when={currentUser()}>
        {(currentUser) => (
          <>
            <div class={'mx-1 md:mx-40 lg:mx-auto lg:w-1/3'}>
              <BasicInfo
                user={currentUser}
                onSave={(newUser: User) => {
                  updateUser(newUser.id, newUser).catch((error) => {
                    console.error(error)
                    toast.error(
                      'Erro ao salvar usuário: \n' +
                        JSON.stringify(error, null, 2),
                    )
                  })
                }}
              />

              <WeightEvolution />
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
                          toast.error(
                            'Erro ao salvar perfil: \n' +
                              JSON.stringify(error, null, 2),
                          )
                        })
                      }}
                      mode="edit"
                    />
                  )}
                </Show>
              </div>
              <MacroEvolution />
              <MeasuresEvolution />
            </div>
            <BottomNavigation />
          </>
        )}
      </Show>
    </Providers>
  )
}

// TODO: Apply provider pattern to all routes
function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <Toaster
        toastOptions={{
          className: 'border-2 border-gray-600 p-1',
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            'font-size': '1.2rem',
          },
        }}
        position="top-center"
      />
      <ConfirmModal />
      {props.children}
    </ConfirmModalProvider>
  )
}
