import { COOKIES } from '@/legacy/constants/cookies'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export type CookieParams = {
  key: string
  value: string
  cookie?: Partial<ResponseCookie>
}

export function createUserIdCookie(userId: string) {
  return {
    key: COOKIES.USER_ID,
    value: userId,
    cookie: {
      expires: new Date('2024-01-19T03:14:07.000Z'),
      httpOnly: true,
    },
  } satisfies CookieParams
}
