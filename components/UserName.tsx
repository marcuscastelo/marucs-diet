import { getUser } from '@/controllers/users'
import { cookies } from 'next/dist/client/components/headers'
import Link from 'next/link'

export default async function UserName() {
  const userId = cookies().get('userId')?.value || '0'

  const user = await getUser(parseInt(userId))

  return <Link href="/profile">{user.name}</Link>
}
