'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ProblemLoading() {
  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* 상단 헤더 스켈레톤 */}
      <div className="px-4 py-3 flex justify-center items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* 중앙 영역 스켈레톤 */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="text-center mb-8 flex items-center justify-center gap-2">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-20" />
        </div>
      </div>

      {/* 하단 버튼 스켈레톤 */}
      <div className="px-4 py-6">
        <div className="flex justify-center gap-10">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
