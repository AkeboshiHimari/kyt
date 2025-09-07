'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/db-types'

interface SettingsClientProps {
  user: User
  profile: Profile | null
}

export default function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [isLoading, setIsLoading] = useState(false)
  
  // 기록 초기화 버튼 상태 (처음 클릭 -> 확인 필요 -> 실행)
  const [resetClickCount, setResetClickCount] = useState(0)
  
  // 회원 탈퇴 버튼 상태 (처음 클릭 -> 확인 필요 -> 실행)
  const [deleteClickCount, setDeleteClickCount] = useState(0)

  const handleNicknameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          nickname: nickname.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      alert('닉네임이 성공적으로 변경되었습니다.')
      router.refresh()
    } catch (error) {
      console.error('Error updating nickname:', error)
      alert('닉네임 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetData = async () => {
    if (resetClickCount === 0) {
      setResetClickCount(1)
      // 5초 후 버튼 상태 리셋
      setTimeout(() => setResetClickCount(0), 5000)
      return
    }

    if (resetClickCount === 1) {
      setIsLoading(true)
      
      try {
        // 모든 사용자 데이터 삭제
        const deleteOperations = [
          supabase.from('user_problem_history').delete().eq('user_id', user.id),
          supabase.from('user_problem_progress').delete().eq('user_id', user.id),
          supabase.from('user_statistics').delete().eq('user_id', user.id),
          supabase.from('user_problem_sessions').delete().eq('user_id', user.id),
          supabase.from('user_rating_history').delete().eq('user_id', user.id),
          supabase.from('user_notes').delete().eq('user_id', user.id),
        ]

        const results = await Promise.allSettled(deleteOperations)
        
        // 실패한 작업이 있는지 확인
        const failedOperations = results.filter(result => result.status === 'rejected')
        
        if (failedOperations.length > 0) {
          console.error('Some reset operations failed:', failedOperations)
          throw new Error('일부 데이터 삭제 작업이 실패했습니다.')
        }

        alert('모든 기록이 성공적으로 초기화되었습니다.')
        setResetClickCount(0)
        router.refresh()
      } catch (error) {
        console.error('Error resetting data:', error)
        alert('기록 초기화 중 오류가 발생했습니다.')
        setResetClickCount(0)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteClickCount === 0) {
      setDeleteClickCount(1)
      // 5초 후 버튼 상태 리셋
      setTimeout(() => setDeleteClickCount(0), 5000)
      return
    }

    if (deleteClickCount === 1) {
      setIsLoading(true)
      
      try {
        // API 라우트를 통해 계정 삭제 요청
        const response = await fetch('/api/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('계정 삭제 요청 실패')
        }

        alert('계정이 성공적으로 삭제되었습니다.')
        
        // 로그아웃 처리
        await supabase.auth.signOut()
        router.push('/')
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('계정 삭제 중 오류가 발생했습니다.')
        setDeleteClickCount(0)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getResetButtonText = () => {
    if (resetClickCount === 0) return '기록 초기화'
    return '정말 초기화하시겠습니까?'
  }

  const getDeleteButtonText = () => {
    if (deleteClickCount === 0) return '회원 탈퇴'
    return '정말 탈퇴하시겠습니까?'
  }

  return (
    <div className="flex flex-col h-full px-6 xl:px-8 py-4">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">설정</h1>
      </div>

      <div className="space-y-8 max-w-md">
        {/* 닉네임 변경 */}
        <section>
          <h2 className="text-xl mb-4">프로필 설정</h2>
          <form onSubmit={handleNicknameUpdate} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">UID</Label>
              <pre>{user.id.slice(-6)}</pre>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">이메일</Label>
              {user.email}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '저장 중...' : '닉네임 저장'}
            </Button>
          </form>
        </section>

        {/* 위험한 작업들 */}
        <section>
          <h2 className="text-xl mb-4">위험한 작업</h2>
          <div className="space-y-4">
            {/* 기록 초기화 */}
            <Button
              onClick={handleResetData}
              disabled={isLoading}
              variant={resetClickCount === 0 ? "outline" : "default"}
              className={`w-full ${
                resetClickCount === 0 
                  ? "border-red-300 text-red-600 hover:bg-red-50" 
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {getResetButtonText()}
            </Button>

            {/* 회원 탈퇴 */}
            <Button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              variant={deleteClickCount === 0 ? "outline" : "default"}
              className={`w-full ${
                deleteClickCount === 0 
                  ? "border-red-300 text-red-600 hover:bg-red-50" 
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {getDeleteButtonText()}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
