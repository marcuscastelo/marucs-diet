import TopBar from './TopBar'
import { fetchUser, updateUser } from '@/controllers/users'
import MacroTarget, { MacroProfile } from '../MacroTargets'
import { revalidatePath } from 'next/cache'
import BasicInfo from './BasicInfo'
import { getUser } from '@/actions/user'
import WeightProgress from './WeightProgress'
import WeightEvolution from './WeightEvolution'
import { fetchUserWeights } from '@/controllers/weights'
import { latestWeight } from '@/utils/weightUtils'

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

  const onSetProfile = async (profile: MacroProfile) => {
    'use server'

    const newUser = {
      ...user,
      macro_profile: profile,
    }

    // Only update the user if the profile has changed
    // TODO: This is a hack to avoid updating the user when the profile is the same
    if (
      JSON.stringify(newUser.macro_profile) ===
      JSON.stringify(user.macro_profile)
    ) {
      return
    }

    await updateUser(newUser.id, newUser)
    console.log('Updating user')
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
          onSave={async () => {
            'use server'
            revalidatePath('/')
          }}
        />

        <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
          {weight !== undefined ? (
            <MacroTarget
              weight={weight}
              profile={user.macro_profile}
              onSaveMacroProfile={onSetProfile}
            />
          ) : (
            <h1>Não há pesos registrados, o perfil não pode ser calculado</h1>
          )}
        </div>
        <WeightEvolution onSave={handleSave} />
        <WeightProgress />
      </div>
    </>
  )
}
