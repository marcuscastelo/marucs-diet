'use server'

import { COOKIES } from '@/legacy/constants/cookies'
import { createUserIdCookie } from '@/legacy/cookies/userId'
import { User } from '@/modules/user/domain/user'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/dist/client/components/headers'

export async function changeUser(userId: User['id']) {
  const newCookie = createUserIdCookie(userId.toString())
  cookies().set(newCookie.key, newCookie.value, newCookie.cookie)
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