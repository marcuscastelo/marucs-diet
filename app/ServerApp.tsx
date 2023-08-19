import { fetchUser } from '@/controllers/users'
import App from './App'
import { getUser } from '@/actions/user'
import { revalidatePath } from 'next/cache'

export default async function ServerApp({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = await getUser()

  if (!userId) {
    return <h1>Usuário não definido</h1>
  }

  const user = await fetchUser(userId)

  if (!user) {
    return <h1>Usuário {userId} não encontrado</h1>
  }

  return (
    <App
      user={user}
      onSaveUser={async () => {
        'use server'
        revalidatePath('/')
      }}
    >
      {children}
    </App>
  )
}
