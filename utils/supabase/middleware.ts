import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function createRedirectResponse(url: URL, headers: Headers) {
  const redirectHeaders = new Headers(headers)
  redirectHeaders.set('Location', url.href)
  return new NextResponse(null, {
    status: 307,
    headers: redirectHeaders,
  })
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if user exists
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  // Public pages that don't require authentication (accessible without login)
  const publicPaths = [
    '/', 
    '/auth/callback', 
    '/auth/auth-code-error',
    '/terms', 
    '/privacy'
  ]
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || (path !== '/' && request.nextUrl.pathname.startsWith(`${path}/`))
  )

  // Special pages that require authentication but have specific access rules
  const isAccountPendingPage = request.nextUrl.pathname.startsWith('/account-pending')

  // Admin-only pages
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
  )

  // Protected pages that require user or admin role
  const protectedPaths = ['/menu', '/problems', '/profile', '/session-summary', '/settings']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
  )

  // Redirect unauthenticated users trying to access protected pages
  if (!user && (isProtectedPath || isAdminPath)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    // Instead of creating a new redirect response, modify the existing one
    // to preserve Supabase's Set-Cookie headers.
    supabaseResponse.headers.set('Location', url.href)
    return new NextResponse(supabaseResponse.body, {
      headers: supabaseResponse.headers,
      status: 307, // Use 307 for temporary redirect to preserve request method
    })
  }

  // If user is not authenticated but trying to access account-pending, redirect to home
  if (!user && isAccountPendingPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    supabaseResponse.headers.set('Location', url.href)
    return new NextResponse(supabaseResponse.body, {
      headers: supabaseResponse.headers,
      status: 307,
    })
  }

  // Role-based access control
  if (user) {
    // Auto-redirect logic for authenticated users on the homepage
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      if (userProfile?.role === 'pending') {
        url.pathname = '/account-pending'
      } else {
        url.pathname = '/menu'
      }
      supabaseResponse.headers.set('Location', url.href)
      return new NextResponse(supabaseResponse.body, {
        headers: supabaseResponse.headers,
        status: 307,
      })
    }

    if (userProfile) {
      const userRole = userProfile.role

      // Redirect pending users to account-pending page (except if they're already there)
      if (userRole === 'pending' && !isAccountPendingPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/account-pending'
        supabaseResponse.headers.set('Location', url.href)
        return new NextResponse(supabaseResponse.body, {
          headers: supabaseResponse.headers,
          status: 307,
        })
      }

      // If pending user is already on account-pending page, allow access
      if (userRole === 'pending' && isAccountPendingPage) {
        return supabaseResponse
      }

      // Allow access to public pages for pending users, except for the root page
      if (userRole === 'pending' && isPublicPath && request.nextUrl.pathname !== '/') {
        return supabaseResponse
      }
      
      // Block access to admin pages for non-admin users
      if (isAdminPath && userRole !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/menu'
        supabaseResponse.headers.set('Location', url.href)
        return new NextResponse(supabaseResponse.body, {
          headers: supabaseResponse.headers,
          status: 307,
        })
      }

      // Block access to protected pages for pending users
      if (isProtectedPath && userRole === 'pending') {
        const url = request.nextUrl.clone()
        url.pathname = '/account-pending'
        supabaseResponse.headers.set('Location', url.href)
        return new NextResponse(supabaseResponse.body, {
          headers: supabaseResponse.headers,
          status: 307,
        })
      }
    } else {
      // User exists but no profile - this shouldn't happen due to the trigger
      // but handle it gracefully.
      // If they're not on a public page, redirect to home.
      // This might happen for a brief moment after sign up.
      if (!isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        supabaseResponse.headers.set('Location', url.href)
        return new NextResponse(supabaseResponse.body, {
          headers: supabaseResponse.headers,
          status: 307,
        })
      }
    }
  } else {
    // Not logged in user can access public paths
    if (isPublicPath) {
      return supabaseResponse
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
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