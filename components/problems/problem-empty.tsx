'use client'

import { Button } from '@/components/ui/button'

interface ProblemEmptyProps {
  onGoHome: () => void
  subjectName?: string
}

export function ProblemEmpty({ onGoHome, subjectName }: ProblemEmptyProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {subjectName ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {subjectName} 문제가 준비 중입니다
            </h2>
            <p className="text-gray-600 mb-4">
              현재 {subjectName} 과목의 문제가 데이터베이스에 등록되어 있지 않습니다.<br/>
              다른 과목을 선택하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              문제를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-4">선택된 조건에 맞는 문제가 없습니다.</p>
          </div>
        )}
        <Button onClick={onGoHome} variant="default" size="lg" className="rounded-full w-full">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  )
}
