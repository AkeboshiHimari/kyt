import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Don't remove getClaims()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  // Get user profile if user exists
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.sub)
      .single()
    userProfile = profile
  }

  const publicPaths = [
    '/login',
    '/auth/callback',
    '/auth/auth-code-error',
    '/terms',
    '/privacy',
  ]
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  // Handle public paths
  if (isPublicPath) {
    if (user && request.nextUrl.pathname === '/login') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/menu'
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // Handle root path - redirect based on auth status
  if (request.nextUrl.pathname === '/') {
    const redirectUrl = request.nextUrl.clone()
    if (user) {
      redirectUrl.pathname = '/menu'
    } else {
      redirectUrl.pathname = '/login'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Require authentication for all other paths
  if (!user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  const isAccountPendingPage =
    request.nextUrl.pathname.startsWith('/account-pending')
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  // Handle role-based redirects
  if (userProfile) {
    const { role } = userProfile
    if (role === 'pending' && !isAccountPendingPage) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/account-pending'
      return NextResponse.redirect(redirectUrl)
    }
    if (role !== 'pending' && isAccountPendingPage) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/menu'
      return NextResponse.redirect(redirectUrl)
    }
    if (role !== 'admin' && isAdminPath) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/menu'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}