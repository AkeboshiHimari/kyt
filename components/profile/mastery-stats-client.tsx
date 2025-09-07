'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface HierarchyNode {
  type: 'subject' | 'chapter' | 'subchapter' | 'problem_type'
  name: string
  rating?: number
  children: HierarchyNode[]
  id: string
}

interface HierarchyDisplayProps {
  nodes: HierarchyNode[]
  level?: number
}

function getRatingColor(rating: number) {
  if (rating >= 900) return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' // 마스터 (레이팅 +8)
  if (rating >= 500) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'     // 절반 달성 (레이팅 +4)
  return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'                        // 기본
}

function HierarchyDisplay({ nodes, level = 0 }: HierarchyDisplayProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  const getIndent = (level: number) => {
    switch (level) {
      case 0: return ''
      case 1: return 'ml-6'
      case 2: return 'ml-12'
      case 3: return 'ml-18'
      default: return 'ml-24'
    }
  }
  
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'subject': return 'text-lg font-bold'
      case 'chapter': return 'text-base font-semibold'
      case 'subchapter': return 'text-sm font-medium'
      case 'problem_type': return 'text-sm'
      default: return ''
    }
  }
  
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id}>
          <div 
            className={`flex justify-between items-center py-2 ${getIndent(level)} ${
              node.children.length > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
            }`}
            onClick={() => node.children.length > 0 && toggleNode(node.id)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && node.children.length > 0) {
                e.preventDefault()
                toggleNode(node.id)
              }
            }}
            role={node.children.length > 0 ? 'button' : undefined}
            tabIndex={node.children.length > 0 ? 0 : undefined}
          >
            <div className="flex items-center space-x-2">
              {node.children.length > 0 && (
                expandedNodes.has(node.id) ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              )}
              <span className={getTypeStyle(node.type)}>
                {node.name}
              </span>
            </div>
            {node.rating !== undefined && (
              <Badge 
                variant="secondary" 
                className={`${getRatingColor(node.rating)} border-none font-medium`}
              >
                {node.rating}
              </Badge>
            )}
          </div>
          {node.children.length > 0 && expandedNodes.has(node.id) && (
            <HierarchyDisplay 
              nodes={node.children} 
              level={level + 1} 
            />
          )}
        </div>
      ))}
    </div>
  )
}

interface MasteryStatsClientProps {
  hierarchy: HierarchyNode[]
}

export function MasteryStatsClient({ hierarchy }: MasteryStatsClientProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">숙련도</h2>

      <HierarchyDisplay nodes={hierarchy} />
    </div>
  )
}
