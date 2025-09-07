import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 일관된 날짜 형식을 위한 유틸리티 함수
export function formatDate(date: string | Date, locale: string = 'ko-KR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}
