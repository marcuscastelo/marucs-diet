'use server'

import { COOKIES } from '@/constants/cookies'
import { User } from '@/model/userModel'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/dist/client/components/headers'

export async function changeUser(userId: User['id']) {
  cookies().set(COOKIES.USER_ID, userId.toString())
  revalidatePath('/')
  // TODO: Maybe revalidatePath('/profile') is not needed
  revalidatePath('/profile')
}

export async function getUser() {
  const value = cookies().get(COOKIES.USER_ID)?.value
  if (value) {
    return parseInt(value)
  }
  return undefined
}
