'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Pause, Home, Play, X } from 'lucide-react'
import NumberFlow, { NumberFlowGroup } from '@number-flow/react'

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
    <div className="px-4 py-3 flex flex-col justify-center items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-4 text-lg">
            <span className="font-medium flex-shrink-0">
              {subjectName}
            </span>
            <NumberFlowGroup>
              <div 
                className="text-muted-foreground font-mono flex items-center min-w-[60px] justify-center"
                style={{ fontVariantNumeric: 'tabular-nums', '--number-flow-char-height': '0.85em' } as React.CSSProperties}
              >
                {hours > 0 && (
                  <>
                    <NumberFlow 
                      trend={1} 
                      value={hours} 
                      format={{ minimumIntegerDigits: 2 }}
                    />
                    <NumberFlow 
                      prefix=":"
                      trend={1}
                      value={displayMinutes}
                      digits={{ 1: { max: 5 } }}
                      format={{ minimumIntegerDigits: 2 }}
                    />
                  </>
                )}
                {hours === 0 && (
                  <NumberFlow 
                    trend={1}
                    value={displayMinutes}
                    digits={{ 1: { max: 5 } }}
                    format={{ minimumIntegerDigits: 1 }}
                  />
                )}
                <NumberFlow 
                  prefix=":"
                  trend={1}
                  value={seconds}
                  digits={{ 1: { max: 5 } }}
                  format={{ minimumIntegerDigits: 2 }}
                />
              </div>
            </NumberFlowGroup>
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
      <div className="text-orange-500 text-sm mt-1 min-h-[20px] flex items-center justify-center">
        {isPaused ? '일시정지' : ''}
      </div>
    </div>
  )
}
