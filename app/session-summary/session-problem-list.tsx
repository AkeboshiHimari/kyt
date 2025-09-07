import type { ExtendedProblem } from '@/lib/db-types'

interface Props {
  problems: Array<{
    problem: ExtendedProblem
    status: 'correct' | 'incorrect' | 'partial'
  }>
}

export function SessionProblemList({ problems }: Props) {
  const getStatusStyle = (status: 'correct' | 'incorrect' | 'partial') => {
    switch (status) {
      case 'correct':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'incorrect':
        return 'bg-destructive/10 text-destructive'
      case 'partial':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    }
  }

  const getStatusText = (status: 'correct' | 'incorrect' | 'partial') => {
    switch (status) {
      case 'correct':
        return '정답'
      case 'incorrect':
        return '오답'
      case 'partial':
        return '부분 정답'
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-4">
        {problems.map(({ problem, status }) => (
          <div 
            key={problem.id} 
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <div className="text-lg font-medium">
                {problem.problem_type?.subchapter.subchapter_name} - 문제 {problem.problem_number}
              </div>
              <div className="text-sm text-muted-foreground">
                {problem.problem_type?.problem_type_name}
                {problem.difficulty && `난이도 ${problem.difficulty}`}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(status)}`}>
              {getStatusText(status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
