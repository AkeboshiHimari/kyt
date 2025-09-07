import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { ExtendedProblem } from '@/lib/db-types'

interface ProblemHistoryRecord {
  id: number
  user_id: string
  problem_id: number
  status: 'correct' | 'partial' | 'incorrect'
  submitted_at: string
  session_id?: number
}

interface UseProblemHistoryReturn {
  isLoading: boolean
  error: string | null
  recordAnswer: (
    problem: ExtendedProblem,
    status: 'correct' | 'partial' | 'incorrect',
    sessionId?: number
  ) => Promise<ProblemHistoryRecord | null>
  batchRecordAnswers: (
    answers: Array<{
      problem: ExtendedProblem,
      status: 'correct' | 'partial' | 'incorrect'
    }>,
    sessionId?: number
  ) => Promise<void>
  clearError: () => void
}

export function useProblemHistory(): UseProblemHistoryReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const recordAnswer = async (
    problem: ExtendedProblem,
    status: 'correct' | 'partial' | 'incorrect',
    sessionId?: number
  ): Promise<ProblemHistoryRecord | null> => {
    try {
      setIsLoading(true)
      setError(null)

      // 현재 사용자 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`사용자 세션을 확인할 수 없습니다: ${sessionError.message}`)
        return null
      }

      if (!session?.user) {
        setError('로그인이 필요합니다')
        return null
      }

      // 문제 풀이 기록 저장
      const historyRecord = {
        user_id: session.user.id,
        problem_id: problem.id,
        status,
        submitted_at: new Date().toISOString(),
        ...(sessionId && { session_id: sessionId })
      }

      const { data, error: insertError } = await supabase
        .from('user_problem_history')
        .insert(historyRecord)
        .select()
        .single()

      if (insertError) {
        setError(`문제 풀이 기록 저장 중 오류가 발생했습니다: ${insertError.message}`)
        console.error('Problem history recording error:', insertError)
        return null
      }

      // Ebbinghaus 망각 곡선에 따른 재출제 로직 업데이트
      const { error: progressError } = await supabase.rpc('update_problem_progress', {
        p_user_id: session.user.id,
        p_problem_id: problem.id,
        p_status: status
      })

      if (progressError) {
        // 이 오류는 치명적이지 않으므로 콘솔에만 기록
        console.error('Problem progress update error:', progressError)
      }

      // 수학과 물리 과목 구분하여 로그 출력
      const isPhysicsProblem = 'problem_type' in problem && problem.problem_type !== undefined
      const logInfo = {
        problemId: problem.id,
        problemNumber: problem.problem_number,
        status,
        sessionId,
        ...(isPhysicsProblem 
          ? { subchapter: problem.problem_type.subchapter.subchapter_name }
          : { chapter: problem.chapter.chapter_name }
        )
      }
      

      return data
    } catch (err) {
      setError('문제 풀이 기록 저장 중 예기치 않은 오류가 발생했습니다')
      console.error('Unexpected problem history error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const batchRecordAnswers = async (
    answers: Array<{
      problem: ExtendedProblem,
      status: 'correct' | 'partial' | 'incorrect'
    }>,
    sessionId?: number
  ): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        setError(sessionError?.message || '로그인이 필요합니다')
        return
      }
      
      const userId = session.user.id

      const historyRecords = answers.map(answer => ({
        user_id: userId,
        problem_id: answer.problem.id,
        status: answer.status,
        submitted_at: new Date().toISOString(),
        ...(sessionId && { session_id: sessionId })
      }))

      if (historyRecords.length === 0) return

      const { error: insertError } = await supabase
        .from('user_problem_history')
        .insert(historyRecords)

      if (insertError) {
        setError(`문제 풀이 기록 저장 중 오류가 발생했습니다: ${insertError.message}`)
        console.error('Problem history batch recording error:', insertError)
        return
      }

      // Ebbinghaus 망각 곡선에 따른 재출제 로직 일괄 업데이트
      const progressUpdates = answers.map(answer => ({
        problem_id: answer.problem.id,
        status: answer.status
      }))
      
      const { error: progressError } = await supabase.rpc('batch_update_problem_progress', {
        p_user_id: userId,
        p_answers: progressUpdates
      })

      if (progressError) {
        console.error('Problem progress batch update error:', progressError)
      }

    } catch (err) {
      setError('문제 풀이 기록 저장 중 예기치 않은 오류가 발생했습니다')
      console.error('Unexpected problem history batch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isLoading,
    error,
    recordAnswer,
    batchRecordAnswers,
    clearError
  }
}
