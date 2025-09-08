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

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/auth/callback',
    '/auth/auth-code-error',
    '/terms',
    '/privacy',
  ]
  
  const isPublicPath = publicPaths.some((path) => {
    if (path === '/') {
      return request.nextUrl.pathname === '/'
    }
    return request.nextUrl.pathname.startsWith(path)
  })

  // If it's a public path, allow access but redirect logged-in users away from login
  if (isPublicPath) {
    if (user && request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/menu'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // For protected paths, redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Handle role-based access control for authenticated users
  // Only fetch profile if user exists and we need role information
  if (user) {
    const isAccountPendingPage = request.nextUrl.pathname.startsWith('/account-pending')
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
    
    // Only query profile if we need role-based logic
    if (isAccountPendingPage || isAdminPath) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        const { role } = profile
        
        // Redirect users with pending role to account-pending page
        if (role === 'pending' && !isAccountPendingPage) {
          const url = request.nextUrl.clone()
          url.pathname = '/account-pending'
          return NextResponse.redirect(url)
        }
        
        // Redirect approved users away from account-pending page
        if (role !== 'pending' && isAccountPendingPage) {
          const url = request.nextUrl.clone()
          url.pathname = '/menu'
          return NextResponse.redirect(url)
        }
        
        // Restrict admin access to admin users only
        if (role !== 'admin' && isAdminPath) {
          const url = request.nextUrl.clone()
          url.pathname = '/menu'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}