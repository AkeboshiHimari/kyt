'use client'

import { useEffect } from 'react'
import { ProblemHeader } from '@/components/problems/problem-header'
import { ProblemDisplay } from '@/components/problems/problem-display'
import { AnswerButtons } from '@/components/problems/answer-buttons'
import { ProblemLoading } from '@/components/problems/problem-loading'
import { ProblemEmpty } from '@/components/problems/problem-empty'
import { useProblemTimer } from '@/hooks/use-problem-timer'
import { useProblemManagement } from '@/hooks/use-problem-management'

export default function ProblemsPage() {
  const {
    problems,
    currentProblemIndex,
    isLoading,
    currentSubjectName,
    handleAnswer
  } = useProblemManagement()

  const { elapsedTime, isPaused, togglePause, resetTimer, formatTime, isTimerStarted } = useProblemTimer()

  // 문제 생성 완료 시 타이머 시작
  useEffect(() => {
    if (!isLoading && problems.length > 0 && !isTimerStarted) {
      resetTimer()
    }
  }, [isLoading, problems.length, isTimerStarted, resetTimer])

  const handleGiveUp = () => {
    if (confirm('정말로 포기하시겠습니까? 진행 상황이 저장되지 않습니다.')) {
      window.location.href = '/'
    }
  }

  const goToHome = () => {
    window.location.href = '/'
  }

  if (isLoading) {
    return <ProblemLoading />
  }

  if (problems.length === 0) {
    return <ProblemEmpty onGoHome={goToHome} subjectName={currentSubjectName} />
  }

  const currentProblem = problems[currentProblemIndex]

  return (
    <div className="min-h-screen flex flex-col">
      <ProblemHeader
        subjectName={currentProblem.problem_type.subchapter.chapter.subject.subject_name}
        elapsedTime={elapsedTime}
        isPaused={isPaused}
        currentProblemIndex={currentProblemIndex}
        totalProblems={problems.length}
        onTogglePause={togglePause}
        onGiveUp={handleGiveUp}
        formatTime={formatTime}
      />

      <ProblemDisplay
        subchapterName={currentProblem.problem_type.subchapter.subchapter_name}
        problemNumber={currentProblem.problem_number}
      />

      <AnswerButtons
        isPaused={isPaused}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
