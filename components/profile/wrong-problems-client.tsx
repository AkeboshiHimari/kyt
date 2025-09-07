'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface WrongProblemsClientProps {
  wrongProblems: WrongProblem[]
}

function getDifficultyColor(difficulty: number | null) {
  if (!difficulty) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  switch (difficulty) {
    case 1: return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
    case 2: return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
    case 3: return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  }
}

function getStatusColor(status: 'incorrect' | 'partial') {
  switch (status) {
    case 'incorrect': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
    case 'partial': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function ProblemCard({ problem }: { problem: WrongProblem }) {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{problem.problem_number}</span>
            {problem.difficulty && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${getDifficultyColor(problem.difficulty)} border-none`}
              >
                난이도 {problem.difficulty}
              </Badge>
            )}
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(problem.status)} border-none`}
            >
              {problem.status === 'incorrect' ? '오답' : '부분정답'}
            </Badge>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {problem.subject_name} &gt; {problem.chapter_name} &gt; {problem.subchapter_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {problem.problem_type_name}
            {problem.page_number && ` • ${problem.textbook_name} p.${problem.page_number}`}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(problem.submitted_at)}
        </div>
      </div>
    </div>
  )
}

export function WrongProblemsClient({ wrongProblems }: WrongProblemsClientProps) {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'partial'>('all')
  
  const filteredProblems = wrongProblems.filter(problem => {
    if (filter === 'all') return true
    return problem.status === filter
  })
  
  const groupedBySubject = filteredProblems.reduce((acc, problem) => {
    const key = problem.subject_name
    if (!acc[key]) acc[key] = []
    acc[key].push(problem)
    return acc
  }, {} as Record<string, WrongProblem[]>)
  
  const incorrectCount = wrongProblems.filter(p => p.status === 'incorrect').length
  const partialCount = wrongProblems.filter(p => p.status === 'partial').length
  
  if (wrongProblems.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">오답노트</h2>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          아직 틀린 문제가 없습니다. 👏
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">오답노트</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          총 {wrongProblems.length}문제 (오답: {incorrectCount}, 부분정답: {partialCount})
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'incorrect' | 'partial')}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="incorrect">오답</TabsTrigger>
          <TabsTrigger value="partial">부분정답</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="mt-4">
          {Object.keys(groupedBySubject).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              해당 카테고리에 문제가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBySubject).map(([subject, problems]) => (
                <div key={subject} className="space-y-3">
                  <h3 className="font-semibold text-lg">{subject}</h3>
                  <div className="space-y-3">
                    {problems.map((problem) => (
                      <ProblemCard key={`${problem.id}-${problem.submitted_at}`} problem={problem} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
