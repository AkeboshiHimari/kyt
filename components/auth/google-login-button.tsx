'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GoogleLoginButtonProps {
  redirectTo?: string
  className?: string
}

export function GoogleLoginButton({ 
  redirectTo,
  className 
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/menu` : '/auth/callback?next=/menu'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google 로그인 오류:', error.message)
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      } else {
        // OAuth 리다이렉트가 시작되면 서버 상태를 새로고침
        router.refresh()
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      variant="default"
      size="lg"
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-label="Google 로고">
          <title>Google 로고</title>
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
      )}
      {isLoading ? '로그인 중...' : 'Google로 로그인'}
    </Button>
  )
}
