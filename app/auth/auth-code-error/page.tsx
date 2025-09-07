'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  const handleRetry = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle>인증 오류</CardTitle>
          <CardDescription>
            Google 로그인 처리 중 문제가 발생했습니다.<br />
            다시 시도해주세요.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">
              인증 코드 처리 중 오류가 발생했습니다. 
              잠시 후 다시 시도하거나 다른 브라우저를 사용해보세요.
            </p>
          </div>
          <Button onClick={handleRetry} className="w-full">
            다시 로그인하기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
