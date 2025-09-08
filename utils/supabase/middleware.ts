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
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle authentication redirects
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/terms') &&
    !request.nextUrl.pathname.startsWith('/privacy')
  ) {
    // no user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login page, redirect to menu
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/menu'
    return NextResponse.redirect(url)
  }

  // Handle root path redirect
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    if (user) {
      url.pathname = '/menu'
    } else {
      url.pathname = '/login'
    }
    return NextResponse.redirect(url)
  }

  // Handle role-based redirects for authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAccountPendingPage = request.nextUrl.pathname.startsWith('/account-pending')
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

    if (profile) {
      const { role } = profile
      if (role === 'pending' && !isAccountPendingPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/account-pending'
        return NextResponse.redirect(url)
      }
      if (role !== 'pending' && isAccountPendingPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/menu'
        return NextResponse.redirect(url)
      }
      if (role !== 'admin' && isAdminPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/menu'
        return NextResponse.redirect(url)
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}