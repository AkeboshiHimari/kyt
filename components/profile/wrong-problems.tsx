import { WrongProblemsClient } from './wrong-problems-client'

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

interface WrongProblemsProps {
  wrongProblems: WrongProblem[]
}

export function WrongProblems({ wrongProblems }: WrongProblemsProps) {
  return <WrongProblemsClient wrongProblems={wrongProblems} />
}
