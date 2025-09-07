import { MasteryStatsClient } from './mastery-stats-client'

interface MasteryItem {
  scope_type: 'subject' | 'chapter' | 'subchapter' | 'problem_type'
  scope_id: number
  rating: number
  scope_name: string
  parent_subject?: string
  parent_chapter?: string
  parent_subchapter?: string
}

interface MasteryStatsProps {
  masteryData: MasteryItem[]
}

interface HierarchyNode {
  type: 'subject' | 'chapter' | 'subchapter' | 'problem_type'
  name: string
  rating?: number
  children: HierarchyNode[]
  id: string
}

function buildHierarchy(masteryData: MasteryItem[]): HierarchyNode[] {
  const hierarchy: HierarchyNode[] = []
  
  // 과목별로 그룹화
  const subjectGroups = masteryData.reduce((acc, item) => {
    let subjectName = ''
    
    if (item.scope_type === 'subject') {
      subjectName = item.scope_name
    } else if (item.parent_subject) {
      subjectName = item.parent_subject
    }
    
    if (subjectName) {
      if (!acc[subjectName]) {
        acc[subjectName] = []
      }
      acc[subjectName].push(item)
    }
    
    return acc
  }, {} as Record<string, MasteryItem[]>)
  
  for (const [subjectName, items] of Object.entries(subjectGroups)) {
    const subjectItem = items.find(item => item.scope_type === 'subject')
    const subjectNode: HierarchyNode = {
      type: 'subject',
      name: subjectName,
      rating: subjectItem?.rating,
      children: [],
      id: `subject-${subjectName}`
    }
    
    // 단원별로 그룹화
    const chapterGroups = items.filter(item => item.scope_type !== 'subject').reduce((acc, item) => {
      const chapterName = item.scope_type === 'chapter' ? item.scope_name : item.parent_chapter
      if (chapterName) {
        if (!acc[chapterName]) {
          acc[chapterName] = []
        }
        acc[chapterName].push(item)
      }
      return acc
    }, {} as Record<string, MasteryItem[]>)
    
    for (const [chapterName, chapterItems] of Object.entries(chapterGroups)) {
      const chapterItem = chapterItems.find(item => item.scope_type === 'chapter')
      const chapterNode: HierarchyNode = {
        type: 'chapter',
        name: chapterName,
        rating: chapterItem?.rating,
        children: [],
        id: `chapter-${subjectName}-${chapterName}`
      }
      
      // 소단원별로 그룹화
      const subchapterGroups = chapterItems.filter(item => item.scope_type !== 'chapter').reduce((acc, item) => {
        const subchapterName = item.scope_type === 'subchapter' ? item.scope_name : item.parent_subchapter
        if (subchapterName) {
          if (!acc[subchapterName]) {
            acc[subchapterName] = []
          }
          acc[subchapterName].push(item)
        }
        return acc
      }, {} as Record<string, MasteryItem[]>)
      
      for (const [subchapterName, subchapterItems] of Object.entries(subchapterGroups)) {
        const subchapterItem = subchapterItems.find(item => item.scope_type === 'subchapter')
        const subchapterNode: HierarchyNode = {
          type: 'subchapter',
          name: subchapterName,
          rating: subchapterItem?.rating,
          children: [],
          id: `subchapter-${subjectName}-${chapterName}-${subchapterName}`
        }
        
        // 문제유형 추가
        const problemTypes = subchapterItems.filter(item => item.scope_type === 'problem_type')
        for (const pt of problemTypes) {
          subchapterNode.children.push({
            type: 'problem_type',
            name: pt.scope_name,
            rating: pt.rating,
            children: [],
            id: `problemtype-${pt.scope_id}`
          })
        }
        
        // 레이팅 순으로 정렬
        subchapterNode.children.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        chapterNode.children.push(subchapterNode)
      }
      
      // 레이팅 순으로 정렬
      chapterNode.children.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      subjectNode.children.push(chapterNode)
    }
    
    // 레이팅 순으로 정렬
    subjectNode.children.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    hierarchy.push(subjectNode)
  }
  
  return hierarchy.sort((a, b) => (b.rating || 0) - (a.rating || 0))
}

// HierarchyDisplay는 클라이언트 컴포넌트로 이동

export function MasteryStats({ masteryData }: MasteryStatsProps) {
  const hierarchy = buildHierarchy(masteryData)
  
  return <MasteryStatsClient hierarchy={hierarchy} />
}
