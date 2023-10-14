import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIES } from '@/constants/cookies'
import { createUserIdCookie } from '@/cookies/userId'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // If USER_ID cookie is not set, set it to DEFAULT_USER_ID
  console.debug(`Cookies: ${JSON.stringify(request.cookies.getAll())}`)
  if (request.cookies.get(COOKIES.USER_ID) === undefined) {
    const url = request.nextUrl.clone()
    const res = NextResponse.redirect(url)

    console.log(
      `Setting cookie ${COOKIES.USER_ID} to ${COOKIES.DEFAULT_USER_ID} because it was not set`,
    )

    // Set cookie on res
    const { key, value, cookie } = createUserIdCookie(COOKIES.DEFAULT_USER_ID)
    res.cookies.set(key, value, cookie)

    return res
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {}
