import { useState, useEffect } from 'react'
import type { ExtendedProblem, FilterOptions } from '@/lib/db-types'
import { ProblemGenerator } from '@/lib/problem-generator'
import {
  getProblemFilters,
  getSubjectSettings,
  convertSettingsToFilters,
  createDefaultFilters,
  extractSubjectFromUrl,
  getActualSubjectName
} from '@/lib/filter-utils'
import { useProblemSession } from '@/hooks/use-problem-session'

const PROBLEM_SESSION_DATA_KEY = 'currentProblemSessionData'

interface UseProblemManagementReturn {
  problems: ExtendedProblem[]
  currentProblemIndex: number
  isLoading: boolean
  filters: FilterOptions
  answerStatus: 'correct' | 'partial' | 'incorrect' | null
  currentSubjectName: string
  setCurrentProblemIndex: (index: number) => void
  setAnswerStatus: (status: 'correct' | 'partial' | 'incorrect' | null) => void
  handleAnswer: (status: 'correct' | 'partial' | 'incorrect') => void
  clearProblemSessionData: () => void
}

export function useProblemManagement(): UseProblemManagementReturn {
  const [problems, setProblems] = useState<ExtendedProblem[]>([])
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'partial' | 'incorrect' | null>(null)
  const [currentSubjectName, setCurrentSubjectName] = useState<string>('')
  const { user, isLoading: isSessionLoading } = useProblemSession()

  const problemGenerator = new ProblemGenerator()

  useEffect(() => {
    if (!isSessionLoading) {
      initializeProblems()
    }
  }, [user, isSessionLoading]) // user가 변경될 때 문제 재생성

  const initializeProblems = async () => {
    setIsLoading(true)

    const savedSessionData = sessionStorage.getItem(PROBLEM_SESSION_DATA_KEY)
    if (savedSessionData) {
      try {
        const { problems, filters, subjectName } = JSON.parse(savedSessionData)
        if (Array.isArray(problems) && problems.length > 0) {
          setProblems(problems)
          setFilters(filters)
          setCurrentSubjectName(subjectName)
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to parse session data from sessionStorage', e)
        sessionStorage.removeItem(PROBLEM_SESSION_DATA_KEY)
      }
    }

    try {
      // 1. localStorage에서 필터 정보 확인
      const savedFilters = getProblemFilters()
      if (savedFilters) {
        setFilters(savedFilters)
        await generateProblems(savedFilters, '') // subjectName을 빈 문자열로 전달
        return
      }

      // 2. subject-settings에서 설정값 가져오기 시도
      const subjectParam = extractSubjectFromUrl()
      if (subjectParam) {
        const subjectSettings = getSubjectSettings(subjectParam)
        if (subjectSettings) {
          const convertedFilters = convertSettingsToFilters(subjectSettings)

          // 과목명 설정
          const actualSubjectName = getActualSubjectName(subjectParam)
          setCurrentSubjectName(actualSubjectName)

          setFilters(convertedFilters)
          await generateProblems(convertedFilters, actualSubjectName)
          return
        }

        // subject-settings가 없으면 현재 과목의 기본 필터 생성
        const actualSubjectName = getActualSubjectName(subjectParam)
        setCurrentSubjectName(actualSubjectName)

        const defaultFilters = await createDefaultFilters(subjectParam)
        setFilters(defaultFilters)
        await generateProblems(defaultFilters, actualSubjectName)
        return
      }

      // 3. 기본 필터로 문제 생성 (과목 정보 없음)
      const defaultFilters = await createDefaultFilters()
      setFilters(defaultFilters)
      await generateProblems(defaultFilters, '')
    } catch (error) {
      console.error('문제 초기화 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateProblems = async (filterOptions: FilterOptions, subjectName: string) => {
    try {
      const optionsWithUser = { ...filterOptions, userId: user?.id }
      const result = await problemGenerator.generateRandomProblems(optionsWithUser)
      setProblems(result.problems)
      setCurrentProblemIndex(0)
      setAnswerStatus(null)

      const sessionData = {
        problems: result.problems,
        filters: filterOptions,
        subjectName: subjectName,
      }
      sessionStorage.setItem(PROBLEM_SESSION_DATA_KEY, JSON.stringify(sessionData))

      if (result.warning) {
        console.warn(result.warning)
      }
    } catch (error) {
      console.error('문제 생성 실패:', error)
      setProblems([])
    }
  }

  const handleAnswer = (status: 'correct' | 'partial' | 'incorrect') => {
    setAnswerStatus(status)

    // 즉시 다음 문제로 이동
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1)
      setAnswerStatus(null)
    }
  }

  const clearProblemSessionData = () => {
    sessionStorage.removeItem(PROBLEM_SESSION_DATA_KEY)
  }

  return {
    problems,
    currentProblemIndex,
    isLoading,
    filters,
    answerStatus,
    currentSubjectName,
    setCurrentProblemIndex,
    setAnswerStatus,
    handleAnswer,
    clearProblemSessionData
  }
}
