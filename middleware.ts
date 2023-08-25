import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIES } from './constants/cookies'

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
    res.cookies.set(COOKIES.USER_ID, COOKIES.DEFAULT_USER_ID, {
      expires: new Date('2038-01-19T03:14:07.000Z'),
      httpOnly: true,
    })
    return res
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {}
