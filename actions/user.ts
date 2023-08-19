'use server'

import { User } from '@/model/userModel'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/dist/client/components/headers'

export async function changeUser(userId: User['id']) {
  cookies().set('userId', userId.toString())
  revalidatePath('/')
}
