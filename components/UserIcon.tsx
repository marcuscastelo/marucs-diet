import { getUser } from '@/actions/user'
import { fetchUser } from '@/controllers/users'
import Image from 'next/image'

export default async function UserIcon() {
  const userId = await getUser()

  if (!userId) {
    return <h1>Usuário {userId} não definido</h1>
  }

  return (
    <Image
      className="h-10 w-10 rounded-full"
      src={`https://sbhhxgeaflzmzpmatnir.supabase.co/storage/v1/object/public/uploads/${userId}.jpg`}
      sizes="100vw"
      alt=""
      width={0}
      height={0}
    />
  )
}
