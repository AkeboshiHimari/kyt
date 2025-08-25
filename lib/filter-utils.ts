import type { FilterOptions } from '@/lib/db-types'
import { createClient } from '@/utils/supabase/client'

// 과목명 매핑
export const SUBJECT_NAME_MAPPING: Record<string, string> = {
  physics: "일반물리학",
  calculus: "미분적분학",
  "linear-algebra": "선형대수학",
}

// 설정 타입 정의
export interface SubjectSettings {
  subjectValue: string
  subjectId?: number
  selectedTextbooks?: number[]
  selectedChapters?: number[]
  selectedSubchapters?: number[]
  selectedDifficulties?: string[]
  totalProblems?: number
}

/**
 * 설정값을 FilterOptions로 변환하는 함수
 */
export function convertSettingsToFilters(settings: SubjectSettings): FilterOptions {
  const difficultyNumbers = settings.selectedDifficulties?.map((d: string) => Number.parseInt(d, 10)) || [2, 3]
  return {
    subjects: settings.subjectId ? [settings.subjectId] : [],
    textbooks: settings.selectedTextbooks || [],
    chapters: settings.selectedChapters || [],
    subchapters: settings.selectedSubchapters || [],
    difficultyRange: [Math.min(...difficultyNumbers), Math.max(...difficultyNumbers)] as [number, number],
    totalProblems: settings.totalProblems || 10
  }
}

/**
 * URL 과목 파라미터에서 실제 과목명을 가져옵니다.
 */
export function getActualSubjectName(subjectParam: string): string {
  return SUBJECT_NAME_MAPPING[subjectParam] || subjectParam
}

/**
 * 과목 파라미터로부터 과목 ID를 가져옵니다.
 */
export async function getSubjectIdByParam(subjectParam: string): Promise<number | null> {
  const supabase = createClient()
  const actualSubjectName = getActualSubjectName(subjectParam)
  
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id")
    .eq("subject_name", actualSubjectName)
    .single()

  return subjectData?.id || null
}

/**
 * localStorage에서 과목 설정을 가져옵니다.
 */
export function getSubjectSettings(subjectParam: string): SubjectSettings | null {
  const settingsJson = localStorage.getItem(`subject-settings-${subjectParam}`)
  if (!settingsJson) return null
  
  try {
    return JSON.parse(settingsJson) as SubjectSettings
  } catch (error) {
    console.error('설정 파싱 오류:', error)
    return null
  }
}

/**
 * localStorage에서 문제 필터를 가져옵니다.
 */
export function getProblemFilters(): FilterOptions | null {
  const filtersJson = localStorage.getItem('problemFilters')
  if (!filtersJson) return null
  
  try {
    return JSON.parse(filtersJson) as FilterOptions
  } catch (error) {
    console.error('필터 파싱 오류:', error)
    return null
  }
}

/**
 * 기본 필터를 생성합니다.
 */
export async function createDefaultFilters(subjectParam?: string): Promise<FilterOptions> {
  if (subjectParam) {
    const subjectId = await getSubjectIdByParam(subjectParam)
    return {
      subjects: subjectId ? [subjectId] : [],
      difficultyRange: [1, 5] as [number, number],
      totalProblems: 10
    }
  }
  
  return {
    difficultyRange: [1, 5] as [number, number],
    totalProblems: 10
  }
}

/**
 * URL에서 과목 파라미터를 추출합니다.
 */
export function extractSubjectFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const subjectFromQuery = urlParams.get('subject')
  const subjectFromPath = window.location.pathname.split('/')[1]
  
  return subjectFromQuery || subjectFromPath || null
}
