import { getUser } from '@/actions/user'
import { fetchUser } from '@/controllers/users'
import Link from 'next/link'

export default async function UserName() {
  const userId = await getUser()

  if (!userId) {
    return <h1>Usuário não encontrado</h1>
  }

  const user = await fetchUser(userId)

  if (!user) {
    return <h1>Usuário {userId} não encontrado</h1>
  }

  return <Link href="/profile">{user.name}</Link>
}
