import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface ProblemSession {
  id: number
  user_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
  elapsed_seconds?: number
}

interface UseProblemSessionReturn {
  currentSession: ProblemSession | null
  user: User | null
  isLoading: boolean
  error: string | null
  startSession: () => Promise<ProblemSession | null>
  completeSession: (elapsedSeconds: number) => Promise<void>
  abandonSession: () => Promise<void>
}

export function useProblemSession(): UseProblemSessionReturn {
  const [currentSession, setCurrentSession] = useState<ProblemSession | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // 현재 사용자 세션 가져오기
    const getUser = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError(`사용자 세션을 가져올 수 없습니다: ${sessionError.message}`)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (err) {
        setError('사용자 인증 확인 중 오류가 발생했습니다')
        console.error('Auth error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          setCurrentSession(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const startSession = async (): Promise<ProblemSession | null> => {
    if (!user) {
      setError('로그인이 필요합니다')
      return null
    }

    try {
      setError(null)
      
      // 새 세션 생성
      const { data, error: insertError } = await supabase
        .from('user_problem_sessions')
        .insert({
          user_id: user.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        setError(`세션 생성 중 오류가 발생했습니다: ${insertError.message}`)
        console.error('Session creation error:', insertError)
        return null
      }

      setCurrentSession(data)
      return data
    } catch (err) {
      setError('세션 생성 중 예기치 않은 오류가 발생했습니다')
      console.error('Unexpected session creation error:', err)
      return null
    }
  }

  const completeSession = async (elapsedSeconds: number): Promise<void> => {
    if (!currentSession) {
      setError('완료할 세션이 없습니다')
      return
    }

    try {
      setError(null)
      
      const { error: updateError } = await supabase
        .from('user_problem_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          elapsed_seconds: elapsedSeconds
        })
        .eq('id', currentSession.id)

      if (updateError) {
        setError(`세션 완료 중 오류가 발생했습니다: ${updateError.message}`)
        console.error('Session completion error:', updateError)
        return
      }

      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'completed',
        completed_at: new Date().toISOString(),
        elapsed_seconds: elapsedSeconds
      } : null)
    } catch (err) {
      setError('세션 완료 중 예기치 않은 오류가 발생했습니다')
      console.error('Unexpected session completion error:', err)
    }
  }

  const abandonSession = async (): Promise<void> => {
    if (!currentSession) {
      return
    }

    try {
      setError(null)
      
      const { error: updateError } = await supabase
        .from('user_problem_sessions')
        .update({
          status: 'abandoned',
          completed_at: new Date().toISOString()
          // 포기 시에는 elapsed_seconds를 기록하지 않거나, 필요하다면 추가
        })
        .eq('id', currentSession.id)

      if (updateError) {
        setError(`세션 포기 중 오류가 발생했습니다: ${updateError.message}`)
        console.error('Session abandon error:', updateError)
        return
      }

      setCurrentSession(null)
    } catch (err) {
      setError('세션 포기 중 예기치 않은 오류가 발생했습니다')
      console.error('Unexpected session abandon error:', err)
    }
  }

  return {
    currentSession,
    user,
    isLoading,
    error,
    startSession,
    completeSession,
    abandonSession
  }
}
