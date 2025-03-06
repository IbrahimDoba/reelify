import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./src/auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl
  // Allow access to landing page and login page for all users
  if (pathname === '/' || pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Redirect to login page if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow access to all other pages for authenticated users
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
