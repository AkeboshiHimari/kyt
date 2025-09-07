import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // A redirect destination can be included as a ?next= parameter
  // If next is not present, default to /menu
  const next = searchParams.get('next') ?? '/menu'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    cookieStore.getAll()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const siteUrl = process.env.SITE_URL
      if (siteUrl) {
        return NextResponse.redirect(`${siteUrl}${next}`)
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // 개발 환경에서는 로컬호스트로 리디렉션
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      if (forwardedHost) {
        // 프로덕션 환경에서는 forwarded host 사용
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }
      
      // fallback
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 오류 발생 시 에러 페이지로 리디렉션
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
