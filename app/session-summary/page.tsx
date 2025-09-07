import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { SessionSummaryClient } from './session-summary-client'
import type { ExtendedProblem } from '@/lib/db-types'

export type SessionSummaryData = {
  totalProblems: number
  correctAnswers: number
  incorrectAnswers: number
  partialAnswers: number
  accuracy: number
  subjectName: string
  subjectId: number
  previousRating: number
  newRating: number
  ratingIncrease: number
  problemHistory: Array<{
    problem: ExtendedProblem
    status: 'correct' | 'incorrect' | 'partial'
  }>
  completedAt: string
  elapsedSeconds: number
}

interface Props {
  searchParams: { sessionId?: string }
}

export default async function SessionSummaryPage({ searchParams }: Props) {
  const sessionId = searchParams.sessionId

  if (!sessionId) {
    redirect('/')
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  try {
    const { data: summaryData, error } = await supabase
      .rpc('get_session_summary', { p_session_id: sessionId })
      .single()

    if (error) {
      console.error('Session summary rpc error:', error)
      redirect('/')
    }

    return <SessionSummaryClient summaryData={summaryData as SessionSummaryData} />
    
  } catch (error) {
    console.error('Session summary error:', error)
    redirect('/')
  }
}