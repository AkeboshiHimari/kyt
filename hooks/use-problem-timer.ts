'use client'

import { useState, useEffect, useCallback } from 'react'

export function useProblemTimer() {
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [pausedAt, setPausedAt] = useState<number>(0)
  const [totalPausedTime, setTotalPausedTime] = useState<number>(0)

  // 타이머 useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (startTime > 0 && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now()
        const actualElapsed = now - startTime - totalPausedTime
        setElapsedTime(Math.max(0, actualElapsed))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPaused, startTime, totalPausedTime])

  const togglePause = useCallback(() => {
    const now = Date.now()
    
    if (isPaused) {
      // 재개: 일시정지된 시간을 누적
      const pauseDuration = now - pausedAt
      setTotalPausedTime(prev => prev + pauseDuration)
      setIsPaused(false)
      setPausedAt(0)
    } else {
      // 일시정지: 현재 시간을 기록
      setIsPaused(true)
      setPausedAt(now)
    }
  }, [isPaused, pausedAt])

  const resetTimer = useCallback(() => {
    const now = Date.now()
    setStartTime(now)
    setElapsedTime(0)
    setTotalPausedTime(0)
    setIsPaused(false)
    setPausedAt(0)
  }, [])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return {
    elapsedTime,
    isPaused,
    togglePause,
    resetTimer,
    formatTime,
    isTimerStarted: startTime > 0
  }
}
