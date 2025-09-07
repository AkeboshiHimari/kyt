

// 데이터베이스 타입 정의
export interface Subject {
  id: number
  subject_name: string
}

export interface Textbook {
  id: number
  subject_id: number
  textbook_name: string
  textbook_abbreviation: string
}

export interface Chapter {
  id: number
  chapter_number: number
  chapter_name: string
  subject_id: number
}

export interface Subchapter {
  id: number
  chapter_id: number
  subchapter_number: string
  subchapter_name: string
}

export interface ProblemType {
  id: number
  subchapter_id: number
  problem_type_name: string
}

export interface Problem {
  id: number
  problem_type_id: number | null // 수학 과목의 경우 null
  page_number: number
  problem_number: string
  image_url: string | null
  difficulty: number
  textbook_id: number
  chapter_id: number | null // 수학 과목의 경우 직접 챕터 참조
  is_curated: boolean
}

// 물리학 문제 (서브챕터와 문제타입 포함)
export interface PhysicsProblem extends Problem {
  textbook: Textbook
  problem_type: ProblemType & {
    subchapter: Subchapter & {
      chapter: Chapter & {
        subject: Subject
      }
    }
  }
  chapter?: never // 물리학 문제는 chapter 직접 참조 없음
}

// 수학 문제 (챕터 직접 참조, 서브챕터 없음)
export interface MathProblem extends Problem {
  textbook: Textbook
  chapter: Chapter & {
    subject: Subject
  }
  problem_type?: never // 수학 문제는 problem_type 없음
}

// 확장된 문제 정보 (조인된 데이터) - 두 타입의 유니온
export type ExtendedProblem = PhysicsProblem | MathProblem

// 사용자 역할 enum
export type UserRole = 'pending' | 'user' | 'admin'

// 프로필 타입
export interface Profile {
  id: string // auth.users.id와 연결
  nickname: string | null
  role: UserRole
  created_at: string | null
  updated_at: string | null
}


// 필터 옵션 타입
export interface FilterOptions {
  subjects?: number[]
  textbooks?: number[]
  chapters?: number[]
  subchapters?: number[]
  difficultyRange?: [number, number]
  problemsPerChapter?: number
  totalProblems?: number
  userId?: string // 사용자 ID 추가
}