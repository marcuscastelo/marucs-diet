import { TopBar } from './TopBar'
import { fetchUser, updateUser } from '@/controllers/users'
import { MacroTarget } from '../MacroTargets'
import { revalidatePath } from 'next/cache'
import { BasicInfo } from './BasicInfo'
import { getUser } from '@/actions/user'
import { MacroEvolution } from './macros/MacroEvolution'
import { WeightEvolution } from './weight/WeightEvolution'
import { fetchUserWeights } from '@/controllers/weights'
import { latestWeight } from '@/utils/weightUtils'
import { MeasuresEvolution } from './measure/MeasuresEvolution'
import { User } from '@/model/userModel'
import { MacroProfile } from '@/model/macroProfileModel'
import {
  fetchUserMacroProfiles,
  insertMacroProfile,
  updateMacroProfile,
} from '@/controllers/macroProfiles'
import { latestMacroProfile } from '@/utils/macroProfileUtils'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export const revalidate = 1
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page() {
  const userId = await getUser()

  if (!userId) {
    return <h1>Usuário não encontrado</h1>
  }

  const user = await fetchUser(userId)

  if (!user) {
    return <h1>Usuário {userId} não encontrado</h1>
  }

  const weights = await fetchUserWeights(userId)
  const weight = latestWeight(weights)?.weight

  const macroProfiles = await fetchUserMacroProfiles(userId)
  const macroProfile = latestMacroProfile(macroProfiles)

  if (!macroProfile) {
    insertMacroProfile({
      owner: userId,
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
          Usuário &apos;{userId}&apos; não possui perfis de macro registrados,
          criando perfil padrão...
        </h1>
      </>
    )
  }

  const onSetProfile = async (profile: MacroProfile) => {
    'use server'

    await updateMacroProfile(profile.id, profile)
    console.log('Updating MacroProfile')
    revalidatePath('/')
  }

  const handleSave = async () => {
    'use server'
    revalidatePath('/')
  }

  console.debug(`[ProfilePage] Rendering profile ${user.name}`)
  return (
    <>
      <TopBar />

      <div className={`mx-1 md:mx-40 lg:mx-auto lg:w-1/3`}>
        <BasicInfo
          user={user}
          onSave={async (newUser: User) => {
            'use server'
            const updatedUser = await updateUser(newUser.id, newUser)
            revalidatePath('/')
            return updatedUser
          }}
        />

        <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
          {weight !== undefined ? (
            <MacroTarget
              weight={weight}
              profile={macroProfile}
              onSaveMacroProfile={onSetProfile}
            />
          ) : (
            <h1>Não há pesos registrados, o perfil não pode ser calculado</h1>
          )}
        </div>
        <MeasuresEvolution onSave={handleSave} />
        <WeightEvolution onSave={handleSave} />
        <MacroEvolution />
      </div>
    </>
  )
}
