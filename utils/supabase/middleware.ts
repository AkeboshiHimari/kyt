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

  // Vercel Routing Middleware에서 인증 기반 리디렉션 처리
  const url = request.nextUrl.clone()

  // 인증이 필요한 경로들
  const protectedPaths = ['/menu', '/profile', '/settings', '/admin', '/problems']
  const publicPaths = ['/login', '/auth', '/terms', '/privacy', '/']

  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // 비로그인 사용자가 보호된 경로에 접근하는 경우
  if (!user && isProtectedPath) {
    url.pathname = '/login'
    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  // 로그인한 사용자가 로그인 페이지에 접근하는 경우
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    url.pathname = '/menu'
    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  // 루트 경로 처리
  if (request.nextUrl.pathname === '/') {
    url.pathname = user ? '/menu' : '/login'
    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  // 역할 기반 리디렉션 (인증된 사용자만)
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
        url.pathname = '/account-pending'
        return NextResponse.redirect(url, {
          status: 302,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
      
      if (role !== 'pending' && isAccountPendingPage) {
        url.pathname = '/menu'
        return NextResponse.redirect(url, {
          status: 302,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
      
      if (role !== 'admin' && isAdminPath) {
        url.pathname = '/menu'
        return NextResponse.redirect(url, {
          status: 302,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
    }
  }

  // 캐시 무효화 헤더 추가
  supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  supabaseResponse.headers.set('Pragma', 'no-cache')
  supabaseResponse.headers.set('Expires', '0')

  return supabaseResponse
}