import { ScrollArea } from '@/components/ui/scroll-area'

interface ActivityData {
  date: string
  problems_solved: number
}

interface ActivityStreakProps {
  activityData: ActivityData[]
}

// 사용자의 첫 활동부터 오늘까지의 모든 날짜 배열 생성
function generateDatesArray(activityData: ActivityData[]) {
  if (activityData.length === 0) return []
  
  const dates = []
  const today = new Date()
  
  // 활동 데이터에서 가장 이른 날짜 찾기
  const earliestDate = new Date(Math.min(...activityData.map(d => new Date(d.date).getTime())))
  
  // 가장 이른 날짜부터 오늘까지 모든 날짜 생성
  const current = new Date(earliestDate)
  while (current <= today) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// 활동 강도에 따른 색상 결정 (30문제 기준으로 조정)
function getActivityColor(problemsSolved: number) {
  if (problemsSolved === 0) return 'bg-gray-100'
  if (problemsSolved <= 5) return 'bg-green-200'
  if (problemsSolved <= 15) return 'bg-green-400'
  if (problemsSolved <= 25) return 'bg-green-600'
  return 'bg-green-800'
}

// 월 이름 가져오기
function getMonthName(date: string) {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  return months[new Date(date).getMonth()]
}

// 활동 데이터를 처리하는 함수
function processActivityData(activityData: ActivityData[]) {
  const allDates = generateDatesArray(activityData)
  const activityMap = new Map(activityData.map(item => [item.date, item.problems_solved]))
  
  // 첫 번째 날의 요일을 기준으로 시작점 조정
  const firstDate = allDates[0] ? new Date(allDates[0]) : new Date()
  const firstDayOfWeek = firstDate.getDay() // 0: 일요일, 1: 월요일, ...
  
  // 일요일부터 시작하도록 앞에 빈 날짜들 추가
  const paddedDates = [...Array(firstDayOfWeek)].map(() => '').concat(allDates)
  
  // 주차별로 그룹화 (각 주는 7개의 요소)
  const weeks: Array<Array<{ date: string, count: number }>> = []
  
  for (let i = 0; i < paddedDates.length; i += 7) {
    const weekData = []
    for (let j = 0; j < 7; j++) {
      const dateIndex = i + j
      if (dateIndex < paddedDates.length) {
        const date = paddedDates[dateIndex]
        const count = date ? (activityMap.get(date) || 0) : 0
        weekData.push({ date, count })
      } else {
        weekData.push({ date: '', count: 0 })
      }
    }
    weeks.push(weekData)
  }
  
  // 월 라벨 생성
  const labels = []
  let currentMonth = ''
  for (let week = 0; week < weeks.length; week++) {
    const firstDayOfWeek = weeks[week].find(day => day.date)?.date
    if (firstDayOfWeek) {
      const monthName = getMonthName(firstDayOfWeek)
      if (monthName !== currentMonth) {
        labels.push({ week, month: monthName })
        currentMonth = monthName
      }
    }
  }
  
  // 스트릭 계산
  const sortedDates = allDates.sort().reverse()
  let currentStreakCount = 0
  let totalStreakDays = 0
  
  // 현재 스트릭 계산
  for (const date of sortedDates) {
    const count = activityMap.get(date) || 0
    if (count > 0) {
      currentStreakCount++
      totalStreakDays++
    } else if (currentStreakCount > 0) {
      // 스트릭이 끊어짐
      break
    }
  }
  
  // 총 활동일수 계산
  totalStreakDays = Array.from(activityMap.values()).filter(count => count > 0).length
  
  return {
    gridData: weeks,
    monthLabels: labels,
    totalStreak: totalStreakDays,
    currentStreak: currentStreakCount
  }
}

export function ActivityStreak({ activityData }: ActivityStreakProps) {
  const { gridData, monthLabels, totalStreak, currentStreak } = processActivityData(activityData)
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">활동 기록</h2>
        <div className="text-left">
          <div className="text-4xl font-bold mb-2">{currentStreak}일</div>
          <div className="text-gray-600">현재 연속 학습일</div>
          <div className="text-sm text-gray-500 mt-2">총 활동일: {totalStreak}일</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border overflow-hidden">
        <div className="flex">
          {/* 요일 라벨 */}
          <div className="flex flex-col space-y-1 mr-2">
            <div className="h-3" /> {/* 월 라벨 공간 */}
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div key={`weekday-${day}`} className="text-xs text-gray-600 h-4 flex items-center">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          {/* 활동 그리드 - 스크롤 가능 */}
          <div className="flex-1">
            <ScrollArea className="w-full">
              <div className="space-y-1">
                {/* 월 라벨 */}
                <div className="relative h-3 mb-2" style={{ minWidth: `${gridData.length * 20}px` }}>
                  {monthLabels.map(({ week, month }) => (
                    <div
                      key={`month-${month}-${week}`}
                      className="absolute text-xs text-gray-600"
                      style={{ left: `${week * 20}px` }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
                
                {/* 활동 그리드 */}
                <div className="flex gap-1 pb-2" style={{ minWidth: `${gridData.length * 20}px` }}>
                  {gridData.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}-${week[0]?.date || 'empty'}`} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`day-${day.date || `${weekIndex}-${dayIndex}`}`}
                          className={`w-4 h-4 rounded flex-shrink-0 ${getActivityColor(day.count)} ${
                            day.date ? 'cursor-pointer' : ''
                          }`}
                          title={day.date ? `${day.date}: ${day.count}문제 해결` : ''}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* 범례 */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>적음</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <div className="w-4 h-4 rounded bg-green-200" />
              <div className="w-4 h-4 rounded bg-green-400" />
              <div className="w-4 h-4 rounded bg-green-600" />
              <div className="w-4 h-4 rounded bg-green-800" />
            </div>
            <span>많음</span>
          </div>
        </div>
      </div>
    </div>
  )
}
