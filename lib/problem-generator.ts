import { createClient } from '@/utils/supabase/client'
import type { ExtendedProblem, FilterOptions } from '@/lib/db-types'

export interface ProblemGenerationResult {
  problems: ExtendedProblem[]
  totalRequested: number
  totalGenerated: number
  warning?: string
}

export class ProblemGenerator {
  private supabase = createClient()

  /**
   * Fisher-Yates 알고리즘을 사용한 진정한 무작위 셔플링
   */
  private fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 주어진 필터 옵션에 따라 랜덤 문제들을 생성합니다.
   */
  async generateRandomProblems(filterOptions: FilterOptions): Promise<ProblemGenerationResult> {
    try {
      const { userId } = filterOptions
      
      // 1. 활성화된 단원들을 가져오기
      const activeChapters = await this.getActiveChapters(filterOptions)

      if (activeChapters.length === 0) {
        return {
          problems: [],
          totalRequested: filterOptions.totalProblems || 10,
          totalGenerated: 0,
          warning: '선택된 조건에 맞는 단원이 없습니다.'
        }
      }

      // 2. 총 문제 수와 단원별 분배 계산
      const totalProblems = filterOptions.totalProblems || filterOptions.problemsPerChapter || 10
      const distributionResult = this.calculateChapterDistribution(activeChapters, totalProblems)

      // 3. 각 단원별로 문제 수집 및 선택
      const allSelectedProblems: ExtendedProblem[] = []
      const actualChapterCounts: { [chapterId: number]: number } = {}
      let totalShortfall = 0
      
      // 첫 번째 패스: 각 단원에서 가능한 만큼 문제 수집
      for (const chapter of distributionResult.selectedChapters) {
        const result = await this.collectProblemsFromChapter(
          chapter, 
          distributionResult.chapterProblemCounts[chapter.id], 
          filterOptions,
          userId
        )
        
        allSelectedProblems.push(...result.problems)
        actualChapterCounts[chapter.id] = result.actualCount
        totalShortfall += result.shortfall
      }

      // 4. 부족한 문제 수를 다른 단원에서 보충
      if (totalShortfall > 0 && allSelectedProblems.length > 0) {
        await this.fillShortfall(
          distributionResult.selectedChapters,
          actualChapterCounts,
          allSelectedProblems,
          totalShortfall,
          filterOptions,
          userId
        )
      }

      // 5. Fisher-Yates 알고리즘으로 진정한 무작위 셔플링
      const finalShuffled = this.fisherYatesShuffle([...allSelectedProblems])
      
      // 디버깅 정보
      
      const warning = finalShuffled.length < totalProblems 
        ? `${totalProblems - finalShuffled.length}개 문제가 부족합니다. 선택된 조건에 맞는 문제가 충분하지 않을 수 있습니다.`
        : undefined

      return {
        problems: finalShuffled,
        totalRequested: totalProblems,
        totalGenerated: finalShuffled.length,
        warning
      }
    } catch (error) {
      console.error('문제 생성 실패:', error)
      throw error
    }
  }

  /**
   * 필터 옵션에 따라 활성화된 단원들을 가져옵니다.
   */
  private async getActiveChapters(filterOptions: FilterOptions) {
    let activeChapters: { id: number; chapter_number: number; chapter_name: string; subject_id: number }[] = []
    
    if (filterOptions.chapters?.length) {
      // 특정 단원이 선택된 경우
      const { data, error } = await this.supabase
        .from('chapters')
        .select('*')
        .in('id', filterOptions.chapters)
      
      if (error) {
        console.error('단원 조회 실패 (ID로 검색):', error)
        throw new Error(`단원 데이터를 가져올 수 없습니다: ${error.message}`)
      }
      activeChapters = data || []
    } else if (filterOptions.subjects?.length) {
      // 특정 과목이 선택된 경우
      const { data, error } = await this.supabase
        .from('chapters')
        .select('*')
        .in('subject_id', filterOptions.subjects)
      
      if (error) {
        console.error('단원 조회 실패 (과목ID로 검색):', error)
        throw new Error(`단원 데이터를 가져올 수 없습니다: ${error.message}`)
      }
      activeChapters = data || []
    } else {
      // 모든 단원
      const { data, error } = await this.supabase
        .from('chapters')
        .select('*')
      
      if (error) {
        console.error('단원 전체 조회 실패:', error)
        throw new Error(`단원 데이터를 가져올 수 없습니다: ${error.message}`)
      }
      activeChapters = data || []
    }

    return activeChapters
  }

  /**
   * 단원별 문제 분배를 계산합니다.
   * 수험 대비를 위해 모든 단원에서 최소 1문제씩 출제를 보장합니다.
   */
  private calculateChapterDistribution(
    activeChapters: { id: number; chapter_number: number; chapter_name: string; subject_id: number }[],
    totalProblems: number
  ) {
    const minProblemsPerChapter = 1 // 각 단원별 최소 1문제
    
    // 수험 대비: 사용자가 정한 문제 수는 고정, 단원 분배만 조정
    const selectedChapters = activeChapters
    const finalAvailableChapters = selectedChapters.length
    const chapterProblemCounts: { [chapterId: number]: number } = {}
    
    // 사용자가 정한 문제 수를 유지하며 최대한 많은 단원을 커버
    const adjustedTotalProblems = totalProblems // 문제 수는 절대 변경하지 않음
    
    if (finalAvailableChapters <= totalProblems) {
      // 단원 수 <= 문제 수: 모든 단원에 최소 1문제씩 보장 가능
      const remainingProblems = totalProblems - finalAvailableChapters
      
      // 먼저 각 단원에 최소 1문제씩 할당
      for (const chapter of selectedChapters) {
        chapterProblemCounts[chapter.id] = minProblemsPerChapter
      }
      
      // 나머지 문제들을 단원별로 균등하게 분배
      if (remainingProblems > 0) {
        const extraPerChapter = Math.floor(remainingProblems / finalAvailableChapters)
        const leftover = remainingProblems % finalAvailableChapters
        
        // Fisher-Yates 셔플을 사용한 진정한 랜덤 분배
        const shuffledIndices = Array.from({length: selectedChapters.length}, (_, i) => i)
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]]
        }
        
        for (let i = 0; i < selectedChapters.length; i++) {
          const chapter = selectedChapters[i]
          chapterProblemCounts[chapter.id] += extraPerChapter
          // 나머지 문제들을 랜덤하게 분배
          if (shuffledIndices[i] < leftover) {
            chapterProblemCounts[chapter.id] += 1
          }
        }
      }
    } else {
      // 단원 수 > 문제 수: 최대한 많은 단원에서 1문제씩, 나머지는 0개
      // 모든 단원을 0으로 초기화
      for (const chapter of selectedChapters) {
        chapterProblemCounts[chapter.id] = 0
      }
      
      // Fisher-Yates로 단원들을 셔플하고 문제 수만큼만 선택하여 1문제씩 할당
      const shuffledChapters = [...selectedChapters]
      for (let i = shuffledChapters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledChapters[i], shuffledChapters[j]] = [shuffledChapters[j], shuffledChapters[i]]
      }
      
      for (let i = 0; i < Math.min(totalProblems, shuffledChapters.length); i++) {
        chapterProblemCounts[shuffledChapters[i].id] = 1
      }
    }


    return {
      selectedChapters,
      chapterProblemCounts
    }
  }

  /**
   * 특정 단원에서 문제들을 수집합니다.
   */
  private async collectProblemsFromChapter(
    chapter: { id: number; chapter_number: number; chapter_name: string; subject_id: number },
    targetCount: number,
    filterOptions: FilterOptions,
    userId?: string
  ) {
    if (targetCount <= 0) {
      return { problems: [], actualCount: 0, shortfall: 0 }
    }

    // 미분적분학(2)과 선형대수학(3)은 서브챕터 없이 직접 챕터에서 문제 조회
    if (chapter.subject_id === 2 || chapter.subject_id === 3) {
      return this.collectProblemsFromMathChapter(chapter, targetCount, filterOptions, userId)
    }

    // 물리학(1) 기존 로직 - 서브챕터와 문제타입을 통한 조회
    // 해당 단원의 subchapter들을 가져오기 (필터 적용)
    let subchapterQuery = this.supabase
      .from('subchapters')
      .select('id')
      .eq('chapter_id', chapter.id)

    // subchapter 필터 적용
    if (filterOptions.subchapters?.length) {
      subchapterQuery = subchapterQuery.in('id', filterOptions.subchapters)
    }

    const { data: subchapters, error: subchapterError } = await subchapterQuery
    if (subchapterError) {
      console.error('서브챕터 조회 실패:', subchapterError)
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }
    if (!subchapters || subchapters.length === 0) {
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }

    const subchapterIds = subchapters.map(sc => sc.id)

    // problem_type을 통해 subchapter 필터링
    const { data: problemTypes, error: problemTypeError } = await this.supabase
      .from('problem_types')
      .select('id')
      .in('subchapter_id', subchapterIds)

    if (problemTypeError) {
      console.error('문제 타입 조회 실패:', problemTypeError)
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }
    if (!problemTypes || problemTypes.length === 0) {
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }
    const problemTypeIds = problemTypes.map(pt => pt.id)

    // 해당 단원의 문제들을 가져오기
    let query = this.supabase
      .from('problems')
      .select(`
        *,
        textbook:textbooks(*),
        problem_type:problem_types!inner(
          *,
          subchapter:subchapters!inner(
            *,
            chapter:chapters!inner(
              *,
              subject:subjects(*)
            )
          )
        )
      `)
      .in('problem_type_id', problemTypeIds)

    // 난이도 필터 적용
    if (filterOptions.difficultyRange) {
      query = query
        .gte('difficulty', filterOptions.difficultyRange[0])
        .lte('difficulty', filterOptions.difficultyRange[1])
    }

    // 교과서 필터 적용
    if (filterOptions.textbooks?.length) {
      query = query.in('textbook_id', filterOptions.textbooks)
    }

    // 사용자 ID가 있는 경우, 이미 맞췄거나 복습 기간이 아닌 문제는 제외
    if (userId) {
      const { data: progressProblemIds, error: progressError } = await this.supabase
        .from('user_problem_progress')
        .select('problem_id')
        .eq('user_id', userId)
        .or('status.eq.mastered,next_review_at.gt.now()')
      
      if (progressError) {
        console.error('사용자 문제 진행도 조회 오류:', progressError)
      } else if (progressProblemIds && progressProblemIds.length > 0) {
        const idsToExclude = progressProblemIds.map(p => p.problem_id)
        query = query.not('id', 'in', `(${idsToExclude.join(',')})`)
      }
    }

    const { data: chapterProblems, error: problemsError } = await query

    if (problemsError) {
      console.error('문제 조회 실패:', problemsError)
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }

    if (chapterProblems && chapterProblems.length > 0) {
              // 해당 단원에서 가능한 만큼 Fisher-Yates로 무작위 선택
        const shuffled = this.fisherYatesShuffle(chapterProblems)
      const actualSelected = Math.min(targetCount, shuffled.length)
      const selected = shuffled.slice(0, actualSelected)
      
      // 물리학 문제 타입 안전성 검증
      const validProblems = selected.filter((p): p is ExtendedProblem => 
        p && 
        typeof p.id === 'number' && 
        p.problem_type && 
        p.problem_type.subchapter && 
        p.problem_type.subchapter.chapter &&
        p.problem_type.subchapter.chapter.subject
      )
      
      if (validProblems.length !== selected.length) {
        console.warn(`데이터 무결성 문제: ${selected.length - validProblems.length}개 문제의 구조가 올바르지 않습니다.`)
      }
      
      return {
        problems: validProblems,
        actualCount: validProblems.length,
        shortfall: Math.max(0, targetCount - validProblems.length)
      }
    }

    return { problems: [], actualCount: 0, shortfall: targetCount }
  }

  /**
   * 미분적분학/선형대수학 전용: 서브챕터 없이 챕터에서 직접 문제를 수집합니다.
   */
  private async collectProblemsFromMathChapter(
    chapter: { id: number; chapter_number: number; chapter_name: string; subject_id: number },
    targetCount: number,
    filterOptions: FilterOptions,
    userId?: string
  ) {
    // 챕터에서 직접 문제 조회 (problem_type_id가 null인 문제들)
    let query = this.supabase
      .from('problems')
      .select(`
        *,
        textbook:textbooks(*),
        chapter:chapters!inner(
          *,
          subject:subjects(*)
        )
      `)
      .eq('chapter_id', chapter.id)
      .is('problem_type_id', null) // 수학 과목은 problem_type_id가 null

    // 난이도 필터 적용
    if (filterOptions.difficultyRange) {
      query = query
        .gte('difficulty', filterOptions.difficultyRange[0])
        .lte('difficulty', filterOptions.difficultyRange[1])
    }

    // 교과서 필터 적용
    if (filterOptions.textbooks?.length) {
      query = query.in('textbook_id', filterOptions.textbooks)
    }

    // 사용자 ID가 있는 경우, 이미 맞췄거나 복습 기간이 아닌 문제는 제외
    if (userId) {
      const { data: progressProblemIds, error: progressError } = await this.supabase
        .from('user_problem_progress')
        .select('problem_id')
        .eq('user_id', userId)
        .or('status.eq.mastered,next_review_at.gt.now()')
      
      if (progressError) {
        console.error('사용자 문제 진행도 조회 오류:', progressError)
      } else if (progressProblemIds && progressProblemIds.length > 0) {
        const idsToExclude = progressProblemIds.map(p => p.problem_id)
        query = query.not('id', 'in', `(${idsToExclude.join(',')})`)
      }
    }

    const { data: chapterProblems, error: problemsError } = await query

    if (problemsError) {
      console.error('수학 문제 조회 실패:', problemsError)
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }

    if (chapterProblems && chapterProblems.length > 0) {
      // 해당 단원에서 가능한 만큼 Fisher-Yates로 무작위 선택
      const shuffled = this.fisherYatesShuffle(chapterProblems)
      const actualSelected = Math.min(targetCount, shuffled.length)
      const selected = shuffled.slice(0, actualSelected)
      
      // 수학 과목용 타입 안전성 검증 (problem_type은 없음)
      const validProblems = selected.filter((p): p is ExtendedProblem => 
        p && 
        typeof p.id === 'number' && 
        p.chapter &&
        p.chapter.subject
      )
      
      if (validProblems.length !== selected.length) {
        console.warn(`수학 문제 데이터 무결성 문제: ${selected.length - validProblems.length}개 문제의 구조가 올바르지 않습니다.`)
      }
      
      return {
        problems: validProblems,
        actualCount: validProblems.length,
        shortfall: Math.max(0, targetCount - validProblems.length)
      }
    }

    return { problems: [], actualCount: 0, shortfall: targetCount }
  }

  /**
   * 부족한 문제 수를 다른 단원에서 보충합니다.
   * N+1 쿼리 문제를 해결하기 위해 일괄 조회를 사용합니다.
   */
  private async fillShortfall(
    selectedChapters: { id: number; chapter_number: number; chapter_name: string; subject_id: number }[],
    actualChapterCounts: { [chapterId: number]: number },
    allSelectedProblems: ExtendedProblem[],
    totalShortfall: number,
    filterOptions: FilterOptions,
    userId?: string
  ) {
    if (totalShortfall <= 0) return

    // 문제가 있는 단원들만 선별
    const chaptersWithProblems = selectedChapters.filter(chapter => 
      actualChapterCounts[chapter.id] > 0
    )
    
    if (chaptersWithProblems.length === 0) return
    
    const chapterIds = chaptersWithProblems.map(c => c.id)
    
    // 미분적분학/선형대수학인지 확인 (첫 번째 챕터의 subject_id로 판단)
    const firstChapterSubjectId = chaptersWithProblems[0]?.subject_id
    const isMathSubject = firstChapterSubjectId === 2 || firstChapterSubjectId === 3
    
    // 일괄로 모든 추가 가능한 문제들을 조회 (이미 선택된 문제 제외)
    const selectedProblemIds = allSelectedProblems.map(p => p.id)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let extraQuery: any
    
    if (isMathSubject) {
      // 수학 과목: 직접 챕터에서 조회
      extraQuery = this.supabase
        .from('problems')
        .select(`
          *,
          textbook:textbooks(*),
          chapter:chapters!inner(
            *,
            subject:subjects(*)
          )
        `)
        .in('chapter_id', chapterIds)
        .is('problem_type_id', null) // 수학 과목은 problem_type_id가 null
    } else {
      // 물리학: 기존 방식
      extraQuery = this.supabase
        .from('problems')
        .select(`
          *,
          textbook:textbooks(*),
          problem_type:problem_types!inner(
            *,
            subchapter:subchapters!inner(
              *,
              chapter:chapters!inner(
                *,
                subject:subjects(*)
              )
            )
          )
        `)
        .in('problem_type.subchapter.chapter_id', chapterIds)
    }
      
    if (selectedProblemIds.length > 0) {
      extraQuery = extraQuery.not('id', 'in', `(${selectedProblemIds.join(',')})`)
    }
    
    // 필터 적용 (물리학만 해당)
    if (!isMathSubject && filterOptions.subchapters?.length) {
      extraQuery = extraQuery.in('problem_type.subchapter_id', filterOptions.subchapters)
    }
    
    if (filterOptions.difficultyRange) {
      extraQuery = extraQuery
        .gte('difficulty', filterOptions.difficultyRange[0])
        .lte('difficulty', filterOptions.difficultyRange[1])
    }
    
    if (filterOptions.textbooks?.length) {
      extraQuery = extraQuery.in('textbook_id', filterOptions.textbooks)
    }

    // 사용자 ID가 있는 경우, 이미 맞췄거나 복습 기간이 아닌 문제는 제외
    if (userId) {
      const { data: progressProblemIds, error: progressError } = await this.supabase
        .from('user_problem_progress')
        .select('problem_id')
        .eq('user_id', userId)
        .or('status.eq.mastered,next_review_at.gt.now()')
      
      if (progressError) {
        console.error('사용자 문제 진행도 조회 오류:', progressError)
      } else if (progressProblemIds && progressProblemIds.length > 0) {
        const idsToExclude = progressProblemIds.map(p => p.problem_id)
        if (idsToExclude.length > 0) {
          extraQuery = extraQuery.not('id', 'in', `(${idsToExclude.join(',')})`)
        }
      }
    }
    
    const { data: extraProblems, error } = await extraQuery
    
    if (error) {
      console.error('추가 문제 조회 실패:', error)
      return
    }
    
    if (extraProblems && extraProblems.length > 0) {
      // Fisher-Yates로 셔플하고 필요한 만큼만 선택
      const shuffledExtra = this.fisherYatesShuffle(extraProblems as ExtendedProblem[])
      const extraCount = Math.min(totalShortfall, shuffledExtra.length)
      const extraSelected = shuffledExtra.slice(0, extraCount)
      
      allSelectedProblems.push(...extraSelected)
      
    }
  }
}
