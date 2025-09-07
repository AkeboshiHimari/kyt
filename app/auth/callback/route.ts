import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Next.js 15+ 쿠키 지연 평가 문제 해결을 위해 쿠키를 미리 읽음
    cookieStore.getAll()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
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
