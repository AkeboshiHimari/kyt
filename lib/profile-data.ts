import type { SupabaseClient } from '@supabase/supabase-js'

// 학과별 반영비율 설정 (추후 사용자 설정으로 변경 가능)
// 예시: 물리 60%, 수학 40%의 경우 physics: 0.6, math: 0.4 (수학은 미분적분학+선형대수학 평균)
export const DEPARTMENT_WEIGHTS = {
  physics: 0.6,    // 물리학과 비중 (기본 50%)
  math: 0.4        // 수학과 비중 (기본 50%, 미분적분학+선형대수학 평균)
}

interface MasteryItem {
  scope_type: 'subject' | 'chapter' | 'subchapter' | 'problem_type'
  scope_id: number
  rating: number
  scope_name: string
  parent_subject?: string
  parent_chapter?: string
  parent_subchapter?: string
}

interface ActivityData {
  date: string
  problems_solved: number
}

interface WrongProblem {
  id: number
  problem_number: string
  page_number: number | null
  difficulty: number | null
  problem_type_name: string
  subchapter_name: string
  chapter_name: string
  subject_name: string
  textbook_name: string
  status: 'incorrect' | 'partial'
  submitted_at: string
}

export interface TopSolvedProblem {
  problem_id: number
  difficulty: number
  is_curated: boolean
  problem_weight: number
  last_solved_at: string
  problem_number: string
  subchapter_name: string
  textbook_name: string
  subject_name: string
  subject_id: number
}

export interface SubjectBreakdown {
  subjectId: number
  solvingScore: number
  problemCountBonus: number
  masteryBonus: number
  solvedProblemCount: number
  totalRating: number
}

export interface ProfileData {
  totalRating: number
  solvingScore: number
  problemCountBonus: number
  masteryBonus: number
  solvedProblemCount: number
  masteryData: MasteryItem[]
  activityData: ActivityData[]
  wrongProblems: WrongProblem[]
  topSolvedProblems: TopSolvedProblem[]
  subjectBreakdowns: SubjectBreakdown[] // 과목별 세부 점수
  allSubjectTopProblems: { [subjectId: number]: TopSolvedProblem[] } // 과목별 상위 문제들
}

// 활동 기록 데이터 처리 (한국 시간 기준)
function processActivityData(historyData: Array<{ submitted_at: string }>) {
  const activityMap: Record<string, number> = {}
  
  for (const item of historyData) {
    // UTC 시간을 한국 시간(UTC+9)으로 변환하여 날짜 추출
    const utcDate = new Date(item.submitted_at)
    const koreaDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)) // UTC+9
    const date = koreaDate.toISOString().split('T')[0]
    activityMap[date] = (activityMap[date] || 0) + 1
  }
  
  return Object.entries(activityMap).map(([date, problems_solved]) => ({
    date,
    problems_solved
  }))
}

// 숙련도 데이터를 단일 쿼리로 조회하고 조합
async function getMasteryData(supabase: SupabaseClient, userId: string): Promise<MasteryItem[]> {
  // 통합된 뷰나 쿼리를 사용하여 한 번에 모든 숙련도 데이터를 가져오기
  const { data: masteryStats } = await supabase.rpc('get_user_mastery_with_names', {
    p_user_id: userId
  }).returns<Array<{
    scope_type: string
    scope_id: number
    rating: number
    scope_name: string
    parent_subject?: string
    parent_chapter?: string
    parent_subchapter?: string
  }>>()

  if (!masteryStats || !Array.isArray(masteryStats)) return []

  return masteryStats.map((item: {
    scope_type: string
    scope_id: number
    rating: number
    scope_name: string
    parent_subject?: string
    parent_chapter?: string
    parent_subchapter?: string
  }) => ({
    scope_type: item.scope_type as 'subject' | 'chapter' | 'subchapter' | 'problem_type',
    scope_id: item.scope_id,
    rating: item.rating,
    scope_name: item.scope_name,
    parent_subject: item.parent_subject,
    parent_chapter: item.parent_chapter,
    parent_subchapter: item.parent_subchapter
  }))
}

// 오답 문제 데이터를 단일 쿼리로 조회
async function getWrongProblems(supabase: SupabaseClient, userId: string): Promise<WrongProblem[]> {
  const { data: wrongProblemsData } = await supabase.rpc('get_user_wrong_problems', {
    user_id: userId,
    limit_count: 100
  }).returns<Array<{
    id: number
    problem_number: string
    page_number: number | null
    difficulty: number | null
    problem_type_name: string
    subchapter_name: string
    chapter_name: string
    subject_name: string
    textbook_name: string
    status: string
    submitted_at: string
  }>>()

  if (!wrongProblemsData || !Array.isArray(wrongProblemsData)) return []

  return wrongProblemsData.map((item: {
    id: number
    problem_number: string
    page_number: number | null
    difficulty: number | null
    problem_type_name: string
    subchapter_name: string
    chapter_name: string
    subject_name: string
    textbook_name: string
    status: string
    submitted_at: string
  }) => ({
    id: item.id,
    problem_number: item.problem_number,
    page_number: item.page_number,
    difficulty: item.difficulty,
    problem_type_name: item.problem_type_name,
    subchapter_name: item.subchapter_name,
    chapter_name: item.chapter_name,
    subject_name: item.subject_name,
    textbook_name: item.textbook_name,
    status: item.status as 'incorrect' | 'partial',
    submitted_at: item.submitted_at
  }))
}

// 과목별 실제 레이팅 구성 요소를 가져오는 함수
async function getRatingBreakdown(supabase: SupabaseClient, userId: string, subjectIds: number[]) {
  let totalSolvingScore = 0
  let totalProblemCountBonus = 0
  let totalMasteryBonus = 0
  let totalSolvedProblems = 0
  const subjectBreakdowns: SubjectBreakdown[] = []
  
  // 학과별 레이팅 계산을 위한 변수
  let physicsRating = 0
  const mathRatings: number[] = []
  let hasPhysicsData = false
  let hasMathData = false

  const breakdownPromises = subjectIds.map(subjectId =>
    supabase.rpc('get_user_rating_breakdown', {
      p_user_id: userId,
      p_subject_id: subjectId
    }).then(({ data }) => ({ subjectId, data }))
  )

  const results = await Promise.all(breakdownPromises)

  for (const result of results) {
    const { subjectId, data: breakdown } = result
    
    if (breakdown && Array.isArray(breakdown) && breakdown.length > 0) {
      const item = breakdown[0] as {
        problem_solving_score: number
        solved_problems_bonus: number
        mastery_bonus: number
        total_rating: number
        solved_problem_count: number
      }
      
      totalSolvingScore += item.problem_solving_score
      totalProblemCountBonus += item.solved_problems_bonus
      totalMasteryBonus += item.mastery_bonus
      totalSolvedProblems += item.solved_problem_count

      // 과목별 breakdown 저장
      const subjectRating = Math.round(item.total_rating)
      subjectBreakdowns.push({
        subjectId,
        solvingScore: Math.round(item.problem_solving_score),
        problemCountBonus: Math.round(item.solved_problems_bonus),
        masteryBonus: Math.round(item.mastery_bonus),
        solvedProblemCount: item.solved_problem_count,
        totalRating: subjectRating
      })
      
      // 학과별 레이팅 분류
      if (subjectId === 1) { // 물리학
        if (subjectRating > 0) {
          physicsRating = subjectRating
          hasPhysicsData = true
        }
      } else if (subjectId === 2 || subjectId === 3) { // 미분적분학, 선형대수학
        if (subjectRating > 0) {
          mathRatings.push(subjectRating)
          hasMathData = true
        }
      }
    } else {
      // 데이터가 없는 과목의 경우 0으로 초기화
      subjectBreakdowns.push({
        subjectId,
        solvingScore: 0,
        problemCountBonus: 0,
        masteryBonus: 0,
        solvedProblemCount: 0,
        totalRating: 0
      })
    }
  }

  // 수학과 평균 레이팅 계산 (미분적분학 + 선형대수학)
  const mathAverageRating = mathRatings.length > 0 
    ? Math.round(mathRatings.reduce((sum, rating) => sum + rating, 0) / mathRatings.length)
    : 0

  // 전체 레이팅 계산 (물리학과 수학과의 가중 평균)
  let overallRating = 0
  let totalWeight = 0
  
  if (hasPhysicsData) {
    overallRating += physicsRating * DEPARTMENT_WEIGHTS.physics
    totalWeight += DEPARTMENT_WEIGHTS.physics
  }
  
  if (hasMathData) {
    overallRating += mathAverageRating * DEPARTMENT_WEIGHTS.math
    totalWeight += DEPARTMENT_WEIGHTS.math
  }
  
  overallRating = totalWeight > 0 ? Math.round(overallRating / totalWeight) : 0

  return {
    overallRating,
    solvingScore: Math.round(totalSolvingScore),
    problemCountBonus: Math.round(totalProblemCountBonus), 
    masteryBonus: Math.round(totalMasteryBonus),
    solvedProblemCount: totalSolvedProblems,
    subjectBreakdowns
  }
}

// 프로필 데이터를 효율적으로 가져오는 메인 함수
export async function getProfileData(supabase: SupabaseClient, userId: string): Promise<ProfileData> {
  // 모든 과목 ID 정의
  const allSubjectIds = [1, 2, 3]

  // 병렬로 데이터 가져오기
  const [
    activityResult, 
    masteryData, 
    wrongProblems, 
    topSolvedResult, 
    allSubjectProblemsResult, 
    breakdown
  ] = await Promise.all([
    // 활동 기록 (지난 49일)
    supabase
      .from('user_problem_history')
      .select('submitted_at')
      .eq('user_id', userId)
      .gte('submitted_at', new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString()),
    
    // 숙련도 데이터 (통합 쿼리)
    getMasteryData(supabase, userId),
    
    // 오답 문제 (통합 쿼리)
    getWrongProblems(supabase, userId),
    
    // 전체 상위 75개 해결한 문제 (전체 탭용)
    supabase.rpc('get_user_top_solved_problems_with_details', {
      p_user_id: userId,
      p_limit: 75
    }).returns<Array<{
      problem_id: number
      difficulty: number
      is_curated: boolean
      problem_weight: number
      last_solved_at: string
      problem_number: string
      subchapter_name: string
      textbook_name: string
      subject_name: string
      subject_id: number
    }>>(),

    // 과목별 상위 75개 해결한 문제 (과목별 탭용)
    supabase.rpc('get_user_all_top_solved_problems', {
      p_user_id: userId,
      p_limit_per_subject: 75
    }).returns<Array<{
      problem_id: number
      difficulty: number
      is_curated: boolean
      problem_weight: number
      last_solved_at: string
      problem_number: string
      subchapter_name: string
      textbook_name: string
      subject_name: string
      subject_id: number
    }>>(),
    
    // 모든 과목에 대해 레이팅 구성 요소 계산
    getRatingBreakdown(supabase, userId, allSubjectIds)
  ])

  // 활동 데이터 처리
  const activityData = processActivityData(activityResult.data || [])
  
  // 전체 상위 75개 해결한 문제 데이터 변환
  const topSolvedProblems: TopSolvedProblem[] = (topSolvedResult.data || []).map((item: any) => ({
    problem_id: item.problem_id,
    difficulty: item.difficulty,
    is_curated: item.is_curated,
    problem_weight: typeof item.problem_weight === 'string' ? parseFloat(item.problem_weight) : item.problem_weight,
    last_solved_at: item.last_solved_at,
    problem_number: item.problem_number,
    subchapter_name: item.subchapter_name || '해당없음',
    textbook_name: item.textbook_name,
    subject_name: item.subject_name,
    subject_id: item.subject_id
  }))

  // 과목별 상위 문제들 데이터 변환 및 그룹화
  const allSubjectTopProblems: { [subjectId: number]: TopSolvedProblem[] } = {}
  ;(allSubjectProblemsResult.data || []).forEach((item: any) => {
    const problem: TopSolvedProblem = {
      problem_id: item.problem_id,
      difficulty: item.difficulty,
      is_curated: item.is_curated,
      problem_weight: typeof item.problem_weight === 'string' ? parseFloat(item.problem_weight) : item.problem_weight,
      last_solved_at: item.last_solved_at,
      problem_number: item.problem_number,
      subchapter_name: item.subchapter_name || '해당없음',
      textbook_name: item.textbook_name,
      subject_name: item.subject_name,
      subject_id: item.subject_id
    }
    
    if (!allSubjectTopProblems[item.subject_id]) {
      allSubjectTopProblems[item.subject_id] = []
    }
    allSubjectTopProblems[item.subject_id].push(problem)
  })

  return {
    totalRating: breakdown.overallRating,
    solvingScore: breakdown.solvingScore,
    problemCountBonus: breakdown.problemCountBonus,
    masteryBonus: breakdown.masteryBonus,
    solvedProblemCount: breakdown.solvedProblemCount,
    masteryData,
    activityData,
    wrongProblems,
    topSolvedProblems,
    subjectBreakdowns: breakdown.subjectBreakdowns,
    allSubjectTopProblems
  }
}

