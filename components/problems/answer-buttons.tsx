'use client'

import { Button } from '@/components/ui/button'
import { X, Triangle, Check } from 'lucide-react'

interface AnswerButtonsProps {
  isPaused: boolean
  onAnswer: (status: 'correct' | 'partial' | 'incorrect') => void
}

export function AnswerButtons({ isPaused, onAnswer }: AnswerButtonsProps) {
  if (isPaused) {
    return (
      <div className="bg-white px-4 py-4">
        <div className="flex justify-center">
          <p className="text-gray-400 text-sm">일시정지 중</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white px-4 py-4">
      <div className="flex justify-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAnswer('incorrect')}
          className="w-16 h-16"
        >
          <X className="w-8 h-8" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAnswer('partial')}
          className="w-16 h-16"
        >
          <Triangle className="w-8 h-8" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAnswer('correct')}
          className="w-16 h-16"
        >
          <Check className="w-8 h-8" />
        </Button>
      </div>
    </div>
  )
}
