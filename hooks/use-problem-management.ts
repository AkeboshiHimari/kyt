import { useState, useEffect } from 'react'
import type { ExtendedProblem, FilterOptions } from '@/lib/db-types'
import { ProblemGenerator } from '@/lib/problem-generator'
import {
  getProblemFilters,
  getSubjectSettings,
  convertSettingsToFilters,
  createDefaultFilters,
  getActualSubjectName,
  fetchUserSettings
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

export function useProblemManagement(subjectParam: string): UseProblemManagementReturn {
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
  }, [user?.id, isSessionLoading, subjectParam]) // user 객체 대신 user.id를 사용하여 불필요한 재실행 방지

  const initializeProblems = async () => {
    setIsLoading(true)
    let forceNewFilters = false

    const savedSessionData = sessionStorage.getItem(PROBLEM_SESSION_DATA_KEY)
    if (savedSessionData) {
      try {
        const { problems, filters, subjectName, subjectParam: savedSubjectParam } = JSON.parse(savedSessionData)
        if (subjectParam === savedSubjectParam) {
          if (Array.isArray(problems) && problems.length > 0) {
            setProblems(problems)
            setFilters(filters)
            setCurrentSubjectName(subjectName)
            setIsLoading(false)
            return
          }
        } else {
          sessionStorage.removeItem(PROBLEM_SESSION_DATA_KEY)
          forceNewFilters = true
        }
      } catch (e) {
        console.error('Failed to parse session data from sessionStorage', e)
        sessionStorage.removeItem(PROBLEM_SESSION_DATA_KEY)
      }
    }

    try {
      // 1. DB에서 사용자 설정 가져오기 (최우선)
      if (user) {
        const dbSettings = await fetchUserSettings(subjectParam)
        if (dbSettings) {
          const filters = convertSettingsToFilters(dbSettings)
          setFilters(filters)
          const subjectName = getActualSubjectName(subjectParam)
          setCurrentSubjectName(subjectName)
          await generateProblems(filters, subjectName, subjectParam)
          return
        }
      }

      // 2. localStorage(subject-settings)에서 설정값 가져오기 시도
      const localSettings = getSubjectSettings(subjectParam)
      if (localSettings) {
        const filters = convertSettingsToFilters(localSettings)
        setFilters(filters)
        const subjectName = getActualSubjectName(subjectParam)
        setCurrentSubjectName(subjectName)
        await generateProblems(filters, subjectName, subjectParam)
        return
      }
      
      // 3. localStorage(problemFilters)에서 필터 정보 확인 (하위 호환성)
      const savedFilters = getProblemFilters()
      if (savedFilters && !forceNewFilters) {
        setFilters(savedFilters)
        await generateProblems(savedFilters, '', subjectParam)
        return
      }

      // 4. 기본 필터로 문제 생성 (과목 정보 없음)
      const actualSubjectName = getActualSubjectName(subjectParam)
      setCurrentSubjectName(actualSubjectName)
      const defaultFilters = await createDefaultFilters(subjectParam)
      setFilters(defaultFilters)
      await generateProblems(defaultFilters, actualSubjectName, subjectParam)
    } catch (error) {
      console.error('문제 초기화 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateProblems = async (filterOptions: FilterOptions, subjectName: string, subjectParam: string) => {
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
        subjectParam: subjectParam,
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
