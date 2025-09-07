'use client'

import { useEffect, useState } from 'react'
import { ProblemHeader } from '@/components/problems/problem-header'
import { ProblemDisplay } from '@/components/problems/problem-display'
import { AnswerButtons } from '@/components/problems/answer-buttons'
import { ProblemLoading } from '@/components/problems/problem-loading'
import { ProblemEmpty } from '@/components/problems/problem-empty'
import { useProblemTimer } from '@/hooks/use-problem-timer'
import { useProblemManagement } from '@/hooks/use-problem-management'
import { useProblemSession } from '@/hooks/use-problem-session'
import { useProblemHistory } from '@/hooks/use-problem-history'
import { useProblemStatistics } from '@/hooks/use-problem-statistics'
import type { ExtendedProblem, PhysicsProblem, MathProblem } from '@/lib/db-types'

type AnswerRecord = {
  problem: ExtendedProblem
  status: 'correct' | 'partial' | 'incorrect'
}

export default function ProblemsPage() {
  const {
    problems,
    currentProblemIndex,
    isLoading,
    currentSubjectName,
    handleAnswer: originalHandleAnswer,
    clearProblemSessionData
  } = useProblemManagement()

  const { elapsedTime, isPaused, togglePause, resetTimer, formatTime, isTimerStarted } = useProblemTimer()
  
  // 세션 관리
  const { 
    currentSession, 
    user, 
    isLoading: sessionLoading, 
    error: sessionError,
    startSession, 
    completeSession, 
    abandonSession 
  } = useProblemSession()
  
  // 문제 기록 관리
  const { 
    batchRecordAnswers,
    error: historyError 
  } = useProblemHistory()
  
  // 통계 관리
  const { 
    batchUpdateStatistics,
    error: statisticsError 
  } = useProblemStatistics()
  
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionAnswers, setSessionAnswers] = useState<AnswerRecord[]>([])
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)

  // 문제 생성 완료 시 세션 시작 및 타이머 시작
  useEffect(() => {
    const initializeSession = async () => {
      if (!isLoading && problems.length > 0 && !sessionStarted && user && !currentSession) {
        const session = await startSession()
        if (session) {
          setSessionStarted(true)
          resetTimer()
        }
      } else if (!isLoading && problems.length > 0 && !isTimerStarted && !user) {
        // 비로그인 사용자는 세션 없이 타이머만 시작
        resetTimer()
      }
    }
    
    initializeSession()
  }, [isLoading, problems.length, isTimerStarted, resetTimer, user, currentSession, sessionStarted, startSession])
  
  // 에러 표시
  useEffect(() => {
    if (sessionError) {
      console.error('세션 오류:', sessionError)
    }
    if (historyError) {
      console.error('기록 저장 오류:', historyError)
    }
    if (statisticsError) {
      console.error('통계 업데이트 오류:', statisticsError)
    }
  }, [sessionError, historyError, statisticsError])

  const handleGiveUp = async () => {
    if (confirm('정말로 포기하시겠습니까? 진행 상황이 저장되지 않습니다.')) {
      // 세션이 있다면 포기 상태로 업데이트
      if (currentSession) {
        await abandonSession()
      }
      clearProblemSessionData()
      window.location.href = '/'
    }
  }

  const goToHome = async () => {
    // 세션이 있다면 포기 상태로 업데이트
    if (currentSession) {
      await abandonSession()
    }
    clearProblemSessionData()
    window.location.href = '/'
  }
  
  // 통합된 답안 처리 함수
  const handleAnswer = async (status: 'correct' | 'partial' | 'incorrect') => {
    // 중복 클릭 방지: 이미 처리 중이면 무시
    if (isProcessingAnswer) return
    
    const currentProblem = problems[currentProblemIndex]
    if (!currentProblem) return
    
    // 답안 처리 시작
    setIsProcessingAnswer(true)
    
    try {
      // 현재 답안을 세션 기록에 추가
      const newAnswer: AnswerRecord = { problem: currentProblem, status }
      const updatedAnswers = [...sessionAnswers, newAnswer]
      setSessionAnswers(updatedAnswers)
    
      // 마지막 문제인지 확인
      const isLastProblem = currentProblemIndex === problems.length - 1
      
      if (isLastProblem) {
        // 로그인한 사용자의 경우, 세션 완료 및 기록/통계 배치 업데이트
        if (user) {
          // [!!!FIX!!!] Promise.all을 제거하고 순차적으로 실행하여 경합 조건을 방지합니다.
          // 1. 먼저 답안을 기록하고 문제 진행 상태(streak)를 업데이트합니다. 통계 계산 전에 이 작업이 반드시 완료되어야 합니다.
          await batchRecordAnswers(updatedAnswers, currentSession?.id)
          
          // 2. 업데이트된 진행 상태를 기반으로 통계와 레이팅을 계산합니다.
          await batchUpdateStatistics(updatedAnswers)
          
          // 3. 모든 계산이 끝난 후 세션을 완료합니다.
          if (currentSession) {
            // elapsedTime을 밀리초에서 초로 변환
            await completeSession(Math.floor(elapsedTime / 1000))
          }

          // 세션 요약 페이지로 이동 전에 세션 데이터 정리
          clearProblemSessionData()
          
          if (currentSession) {
            window.location.href = `/session-summary?sessionId=${currentSession.id}`
          } else {
            // 세션이 없는 경우 홈으로 이동
            alert('모든 문제를 완료했습니다! 수고하셨습니다.')
            clearProblemSessionData()
            window.location.href = '/'
          }
        } else {
          // 비로그인 사용자는 홈으로 이동
          alert('모든 문제를 완료했습니다! 수고하셨습니다.')
          clearProblemSessionData()
          window.location.href = '/'
        }
      } else {
        // 다음 문제로 이동
        originalHandleAnswer(status)
        // 다음 문제로 이동 후 처리 상태 해제
        setIsProcessingAnswer(false)
      }
    } catch (error) {
      console.error('답안 처리 중 오류:', error)
      // 오류 발생 시에도 처리 상태 해제
      setIsProcessingAnswer(false)
    }
  }

  if (isLoading || sessionLoading) {
    return <ProblemLoading />
  }

  if (problems.length === 0) {
    return <ProblemEmpty onGoHome={goToHome} subjectName={currentSubjectName} />
  }

  // 에러 상태 표시 (치명적이지 않은 에러들)
  if (sessionError && !currentSession && user) {
    console.warn('세션 생성 실패, 비세션 모드로 계속 진행:', sessionError)
  }

  const currentProblem = problems[currentProblemIndex]

  // 문제 타입에 따라 데이터 구조가 다름 (물리학 vs 수학)
  // 타입 가드 함수들
  const isPhysicsProblem = (problem: ExtendedProblem): problem is PhysicsProblem => {
    return 'problem_type' in problem && problem.problem_type !== undefined
  }
  
  const isMathProblem = (problem: ExtendedProblem): problem is MathProblem => {
    return 'chapter' in problem && problem.chapter !== undefined
  }
  
  const physicsCheck = isPhysicsProblem(currentProblem)
  const mathCheck = isMathProblem(currentProblem)
  
  const subjectName = physicsCheck 
    ? currentProblem.problem_type.subchapter.chapter.subject.subject_name
    : mathCheck 
    ? currentProblem.chapter.subject.subject_name
    : '과목 정보 없음'
    
  const textbookName = currentProblem.textbook?.textbook_name
    
  const subchapterName = physicsCheck 
    ? currentProblem.problem_type.subchapter.subchapter_name
    : undefined // 수학 과목은 서브챕터가 없음

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <ProblemHeader
        subjectName={subjectName}
        elapsedTime={elapsedTime}
        isPaused={isPaused}
        currentProblemIndex={currentProblemIndex}
        totalProblems={problems.length}
        onTogglePause={togglePause}
        onGiveUp={handleGiveUp}
        formatTime={formatTime}
      />

      <ProblemDisplay
        subchapterName={subchapterName}
        problemNumber={currentProblem.problem_number}
        textbookName={textbookName}
        isPaused={isPaused}
      />

      <AnswerButtons
        isPaused={isPaused}
        isProcessing={isProcessingAnswer}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
