

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
  problem_type_id: number
  page_number: number
  problem_number: string
  image_url: string | null
  difficulty: number
  textbook_id: number
}

// 확장된 문제 정보 (조인된 데이터)
export interface ExtendedProblem extends Problem {
  textbook: Textbook
  problem_type: ProblemType & {
    subchapter: Subchapter & {
      chapter: Chapter & {
        subject: Subject
      }
    }
  }
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
}