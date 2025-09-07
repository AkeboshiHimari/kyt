import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { ExtendedProblem, PhysicsProblem, MathProblem } from '@/lib/db-types'

interface StatisticsUpdate {
  user_id: string
  scope_type: 'subject' | 'chapter' | 'subchapter' | 'problem_type'
  scope_id: number
  total_weighted_score: number
  correct_weighted_score: number
  rating: number
  last_updated: string
}

interface UseProblemStatisticsReturn {
  isLoading: boolean
  error: string | null
  updateStatistics: (
    problem: ExtendedProblem,
    status: 'correct' | 'partial' | 'incorrect'
  ) => Promise<void>
  batchUpdateStatistics: (
    answers: Array<{
      problem: ExtendedProblem,
      status: 'correct' | 'partial' | 'incorrect'
    }>
  ) => Promise<void>
  clearError: () => void
}

export function useProblemStatistics(): UseProblemStatisticsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // 타입 가드 함수들
  const isPhysicsProblem = (problem: ExtendedProblem): problem is PhysicsProblem => {
    return 'problem_type' in problem && problem.problem_type !== undefined
  }
  
  const isMathProblem = (problem: ExtendedProblem): problem is MathProblem => {
    return 'chapter' in problem && problem.chapter !== undefined
  }

  // 문제 난이도에 따른 점수 계산 (새로운 정책)
  const calculateProblemWeight = (problem: ExtendedProblem): number => {
    const difficulty = problem.difficulty ?? 0
    let score: number
    switch (difficulty) {
      case 1:
        score = 3
        break
      case 2:
        score = 8
        break
      case 3:
        score = 20
        break
      default:
        score = 1
        break
    }
    if ('is_curated' in problem && problem.is_curated) {
      score *= 1.2
    }
    return score
  }
  
  // 정답 상태에 따른 득점 계산
  const calculateCorrectScore = (weight: number, status: 'correct' | 'partial' | 'incorrect'): number => {
    switch (status) {
      case 'correct':
        return weight
      case 'partial':
        return Math.floor(weight * 0.5) // 50% 점수
      case 'incorrect':
        return 0
      default:
        return 0
    }
  }

  // 레이팅 계산 (정답률 기반) - 더 이상 사용되지 않음
  /*
  const calculateRating = (correctScore: number, totalScore: number): number => {
    if (totalScore === 0) return 0
    const accuracy = correctScore / totalScore
    return Math.round(accuracy * 1000) // 0-1000 범위의 레이팅
  }
  */

  const updateStatistics = async (
    problem: ExtendedProblem,
    status: 'correct' | 'partial' | 'incorrect'
  ): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // 현재 사용자 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`사용자 세션을 확인할 수 없습니다: ${sessionError.message}`)
        return
      }

      if (!session?.user) {
        setError('로그인이 필요합니다')
        return
      }

      const userId = session.user.id
      const problemWeight = calculateProblemWeight(problem)
      const correctScore = calculateCorrectScore(problemWeight, status)

      // 업데이트할 통계 범위들 (과목별로 다르게 처리)
      const statisticsUpdates: Array<{
        scope_type: 'subject' | 'chapter' | 'subchapter' | 'problem_type'
        scope_id: number
      }> = []

      if (isPhysicsProblem(problem)) {
        // 물리학: 기존 방식 (subchapter, problem_type 포함)
        statisticsUpdates.push(
          { scope_type: 'subject', scope_id: problem.problem_type.subchapter.chapter.subject.id },
          { scope_type: 'chapter', scope_id: problem.problem_type.subchapter.chapter.id },
          { scope_type: 'subchapter', scope_id: problem.problem_type.subchapter.id },
          { scope_type: 'problem_type', scope_id: problem.problem_type.id }
        )
      } else if (isMathProblem(problem)) {
        // 수학: 간소화된 방식 (subject, chapter만)
        statisticsUpdates.push(
          { scope_type: 'subject', scope_id: problem.chapter.subject.id },
          { scope_type: 'chapter', scope_id: problem.chapter.id }
        )
      }

      // 각 범위별로 통계 업데이트
      for (const update of statisticsUpdates) {
        try {
          // 1. 현재 사용자 통계 조회
          const { data: currentStats, error: selectUserStatsError } = await supabase
            .from('user_statistics')
            .select('*')
            .eq('user_id', userId)
            .eq('scope_type', update.scope_type)
            .eq('scope_id', update.scope_id)
            .maybeSingle()

          if (selectUserStatsError) {
            console.error(`사용자 통계 조회 오류 (${update.scope_type}:${update.scope_id}):`, selectUserStatsError)
            continue
          }
          
          // 2. 해당 범위의 전체 가중치 총점 조회
          const { data: scopeStats, error: selectScopeStatsError } = await supabase
            .from('scope_statistics')
            .select('total_weighted_score')
            .eq('scope_type', update.scope_type)
            .eq('scope_id', update.scope_id)
            .single()

          if (selectScopeStatsError || !scopeStats) {
            console.error(`전체 범위 통계 조회 오류 (${update.scope_type}:${update.scope_id}):`, selectScopeStatsError)
            continue
          }
          
          const totalScopeWeightedScore = scopeStats.total_weighted_score

          // 3. 사용자 점수 업데이트
          const newTotalAttemptedScore = (currentStats?.total_weighted_score || 0) + problemWeight
          const newCorrectScore = (currentStats?.correct_weighted_score || 0) + correctScore
          
          const statisticsRecord = {
            user_id: userId,
            scope_type: update.scope_type,
            scope_id: update.scope_id,
            total_weighted_score: newTotalAttemptedScore,
            correct_weighted_score: newCorrectScore,
            last_updated: new Date().toISOString()
          }

          // upsert 사용하여 통계 업데이트 또는 생성
          const { error: upsertError } = await supabase
            .from('user_statistics')
            .upsert(statisticsRecord, {
              onConflict: 'user_id,scope_type,scope_id'
            })

          if (upsertError) {
            console.error(`통계 업데이트 오류 (${update.scope_type}:${update.scope_id}):`, upsertError)
          }
        } catch (err) {
          console.error(`통계 업데이트 중 예기치 않은 오류 (${update.scope_type}:${update.scope_id}):`, err)
        }
      }
    } catch (err) {
      setError('통계 업데이트 중 예기치 않은 오류가 발생했습니다')
      console.error('Unexpected statistics error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const batchUpdateStatistics = async (
    answers: Array<{
      problem: ExtendedProblem,
      status: 'correct' | 'partial' | 'incorrect'
    }>
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

      if (answers.length === 0) {
        return
      }

       // 1. 각 범위별 점수 변화량 집계 (이 로직은 이제 DB 함수 내부에서 처리됨)
 
       if (answers.length > 0) {
         // 레이팅 계산 및 업데이트
         const answersForRating = answers.map(({ problem, status }) => ({
           problem_id: problem.id,
           status
         }))
 
         const { error: ratingError } = await supabase.rpc('batch_update_granular_ratings', {
           p_user_id: userId,
           p_answers: answersForRating
         })
 
         if (ratingError) {
           throw new Error(`레이팅 업데이트 RPC 호출 오류: ${ratingError.message}`)
         }
 
         // 과목별 올바른 레이팅 히스토리 업데이트
         const subjectIds = new Set<number>()
         for (const answer of answers) {
           const { problem } = answer
           if (isPhysicsProblem(problem)) {
             subjectIds.add(problem.problem_type.subchapter.chapter.subject.id)
           } else if (isMathProblem(problem)) {
             subjectIds.add(problem.chapter.subject.id)
           }
         }
 
         // 각 과목에 대해 최종 레이팅 재계산 RPC 호출
         for (const subjectId of subjectIds) {
           const { error: calcError } = await supabase.rpc('calculate_user_rating', {
             p_user_id: userId,
             p_subject_id: subjectId
           })
           
           if (calcError) {
             console.error(`과목 ${subjectId} 최종 레이팅 계산 오류:`, calcError)
           }
         }
         
         // 모든 계산이 끝난 후, 히스토리 기록 함수를 별도로 호출
         for (const subjectId of subjectIds) {
             const { error: historyError } = await supabase.rpc('update_rating_history_for_subject', {
                 p_user_id: userId,
                 p_subject_id: subjectId
             })
 
             if (historyError) {
                 console.error(`과목 ${subjectId} 레이팅 히스토리 업데이트 오류:`, historyError)
             }
         }
 
       }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`통계 업데이트 중 예기치 않은 오류가 발생했습니다: ${errorMessage}`)
      console.error('Unexpected batch statistics error:', err)
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
    updateStatistics,
    batchUpdateStatistics,
    clearError
  }
}
