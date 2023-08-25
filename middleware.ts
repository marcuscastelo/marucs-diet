import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIES } from './constants/cookies'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const res = NextResponse.next()
  // If USER_ID cookie is not set, set it to DEFAULT_USER_ID
  if (!request.cookies.has(COOKIES.USER_ID)) {
    // TODO: After setting cookie, redirect to the same page to make sure the cookie is set when the page loads
    res.cookies.set(COOKIES.USER_ID, COOKIES.DEFAULT_USER_ID, {
      expires: new Date('2024-01-19T03:14:07.000Z'),
      httpOnly: true,
    })
  }

  return res
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
}
