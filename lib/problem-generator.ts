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
   * 주어진 필터 옵션에 따라 랜덤 문제들을 생성합니다.
   */
  async generateRandomProblems(filterOptions: FilterOptions): Promise<ProblemGenerationResult> {
    try {
      
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
          filterOptions
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
          filterOptions
        )
      }

      // 5. 전체 문제를 다시 섞어서 순서 무작위화
      const finalShuffled = allSelectedProblems.sort(() => Math.random() - 0.5)
      
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
      const { data } = await this.supabase
        .from('chapters')
        .select('*')
        .in('id', filterOptions.chapters)
      activeChapters = data || []
    } else if (filterOptions.subjects?.length) {
      // 특정 과목이 선택된 경우
      const { data } = await this.supabase
        .from('chapters')
        .select('*')
        .in('subject_id', filterOptions.subjects)
      activeChapters = data || []
    } else {
      // 모든 단원
      const { data } = await this.supabase
        .from('chapters')
        .select('*')
      activeChapters = data || []
    }

    return activeChapters
  }

  /**
   * 단원별 문제 분배를 계산합니다.
   */
  private calculateChapterDistribution(
    activeChapters: { id: number; chapter_number: number; chapter_name: string; subject_id: number }[],
    totalProblems: number
  ) {
    const minProblemsPerChapter = 1 // 각 단원별 최소 1문제
    
    // 단원 수가 총 문제 수보다 많은 경우 처리
    let selectedChapters = activeChapters
    if (activeChapters.length > totalProblems) {
      // 총 문제 수만큼만 단원을 선택 (랜덤)
      const shuffledChapters = [...activeChapters].sort(() => Math.random() - 0.5)
      selectedChapters = shuffledChapters.slice(0, totalProblems)
    }
    
    const finalAvailableChapters = selectedChapters.length
    const chapterProblemCounts: { [chapterId: number]: number } = {}
    
    // 각 단원별 최소 1문제를 보장하고 나머지를 비례 분배
    const remainingProblems = totalProblems - finalAvailableChapters
    
    // 먼저 각 단원에 최소 1문제씩 할당
    for (const chapter of selectedChapters) {
      chapterProblemCounts[chapter.id] = minProblemsPerChapter
    }
    
    // 나머지 문제들을 단원별로 균등하게 분배
    if (remainingProblems > 0) {
      const extraPerChapter = Math.floor(remainingProblems / finalAvailableChapters)
      const leftover = remainingProblems % finalAvailableChapters
      
      for (let index = 0; index < selectedChapters.length; index++) {
        const chapter = selectedChapters[index]
        chapterProblemCounts[chapter.id] += extraPerChapter
        if (index < leftover) {
          chapterProblemCounts[chapter.id] += 1
        }
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
    filterOptions: FilterOptions
  ) {
    if (targetCount <= 0) {
      return { problems: [], actualCount: 0, shortfall: 0 }
    }

    // 해당 단원의 subchapter들을 가져오기 (필터 적용)
    let subchapterQuery = this.supabase
      .from('subchapters')
      .select('id')
      .eq('chapter_id', chapter.id)

    // subchapter 필터 적용
    if (filterOptions.subchapters?.length) {
      subchapterQuery = subchapterQuery.in('id', filterOptions.subchapters)
    }

    const { data: subchapters } = await subchapterQuery
    if (!subchapters || subchapters.length === 0) {
      return { problems: [], actualCount: 0, shortfall: targetCount }
    }

    const subchapterIds = subchapters.map(sc => sc.id)

    // problem_type을 통해 subchapter 필터링
    const { data: problemTypes } = await this.supabase
      .from('problem_types')
      .select('id')
      .in('subchapter_id', subchapterIds)

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

    const { data: chapterProblems } = await query

    if (chapterProblems && chapterProblems.length > 0) {
      // 해당 단원에서 가능한 만큼 랜덤하게 문제 선택
      const shuffled = [...chapterProblems].sort(() => Math.random() - 0.5)
      const actualSelected = Math.min(targetCount, shuffled.length)
      const selected = shuffled.slice(0, actualSelected)
      
      return {
        problems: selected as ExtendedProblem[],
        actualCount: actualSelected,
        shortfall: Math.max(0, targetCount - actualSelected)
      }
    }

    return { problems: [], actualCount: 0, shortfall: targetCount }
  }

  /**
   * 부족한 문제 수를 다른 단원에서 보충합니다.
   */
  private async fillShortfall(
    selectedChapters: { id: number; chapter_number: number; chapter_name: string; subject_id: number }[],
    actualChapterCounts: { [chapterId: number]: number },
    allSelectedProblems: ExtendedProblem[],
    totalShortfall: number,
    filterOptions: FilterOptions
  ) {
    // 문제가 많은 단원에서 추가로 선택
    const chaptersWithExtra = selectedChapters.filter(chapter => 
      actualChapterCounts[chapter.id] > 0
    )
    
    let remainingShortfall = totalShortfall
    for (const chapter of chaptersWithExtra) {
      if (remainingShortfall <= 0) break
      
      // 해당 단원에서 추가 문제 가져오기 (이미 선택된 문제 제외)
      const currentChapterProblems = allSelectedProblems.filter(p => 
        p.problem_type.subchapter.chapter.id === chapter.id
      )
      
      // 다시 해당 단원의 모든 문제를 가져와서 이미 선택된 것 제외
      const subchapterIds = (await this.supabase
        .from('subchapters')
        .select('id')
        .eq('chapter_id', chapter.id)).data?.map(sc => sc.id) || []
      
      if (subchapterIds.length === 0) continue
      
      const problemTypeIds = (await this.supabase
        .from('problem_types')
        .select('id')
        .in('subchapter_id', subchapterIds)).data?.map(pt => pt.id) || []
      
      if (problemTypeIds.length === 0) continue
      
      let extraQuery = this.supabase
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
      
      if (filterOptions.difficultyRange) {
        extraQuery = extraQuery
          .gte('difficulty', filterOptions.difficultyRange[0])
          .lte('difficulty', filterOptions.difficultyRange[1])
      }
      
      if (filterOptions.textbooks?.length) {
        extraQuery = extraQuery.in('textbook_id', filterOptions.textbooks)
      }
      
      const { data: extraProblems } = await extraQuery
      
      if (extraProblems && extraProblems.length > 0) {
        // 이미 선택된 문제 제외
        const selectedIds = currentChapterProblems.map(p => p.id)
        const availableExtra = extraProblems.filter(p => !selectedIds.includes(p.id))
        
        if (availableExtra.length > 0) {
          const shuffledExtra = [...availableExtra].sort(() => Math.random() - 0.5)
          const extraCount = Math.min(remainingShortfall, shuffledExtra.length)
          const extraSelected = shuffledExtra.slice(0, extraCount)
          allSelectedProblems.push(...extraSelected as ExtendedProblem[])
          remainingShortfall -= extraCount
        }
      }
    }
  }
}
