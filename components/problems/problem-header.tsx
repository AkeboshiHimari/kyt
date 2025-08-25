'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Pause, Home, Play, X } from 'lucide-react'
import  NumberFlow  from '@number-flow/react'

interface ProblemHeaderProps {
  subjectName: string
  elapsedTime: number
  isPaused: boolean
  currentProblemIndex: number
  totalProblems: number
  onTogglePause: () => void
  onGiveUp: () => void
  formatTime: (ms: number) => string
}

export function ProblemHeader({
  subjectName,
  elapsedTime,
  isPaused,
  currentProblemIndex,
  totalProblems,
  onTogglePause,
  onGiveUp,
  formatTime
}: ProblemHeaderProps) {
  // 시간을 분과 초로 분리
  const totalSeconds = Math.floor(elapsedTime / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const hours = Math.floor(minutes / 60)
  const displayMinutes = minutes % 60

  return (
    <div className="bg-white px-4 py-3 flex justify-center items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-4 text-lg">
            <span className="font-medium flex-shrink-0">
              {subjectName}
            </span>
            <div className="text-gray-600 font-mono flex items-center min-w-[60px] justify-center">
              {hours > 0 && (
                <>
                  <NumberFlow value={hours} />
                  <span>:</span>
                </>
              )}
              <NumberFlow 
                value={displayMinutes} 
                format={{ minimumIntegerDigits: hours > 0 ? 2 : 1 }}
              />
              <span>:</span>
              <NumberFlow 
                value={seconds} 
                format={{ minimumIntegerDigits: 2 }}
              />
            </div>
            {isPaused && <span className="text-orange-500 text-sm flex-shrink-0">일시정지</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2">
          <div className="space-y-4">            
            <div className="flex gap-2 justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onTogglePause}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onGiveUp}
              >
                <X className="w-3 h-3 text-red-600 hover:text-red-500" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
