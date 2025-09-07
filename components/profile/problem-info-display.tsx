"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { TopSolvedProblem } from "@/lib/profile-data";
import { formatDate } from "@/lib/utils";
import { Circle, Star } from "lucide-react";

interface ProblemInfoDisplayProps {
  problem: TopSolvedProblem;
  index: number;
  className: string;
  displayValue: number;
}

function getDifficultyColor(difficulty: number) {
  switch (difficulty) {
    case 3:
      return 'bg-gray-900 text-white';
    case 2:
      return 'bg-gray-600 text-white';
    case 1:
      return 'bg-gray-400 text-gray-900';
    default:
      return 'bg-gray-100 text-gray-900 border border-gray-300';
  }
}

function ProblemInfoContent({ problem }: { problem: TopSolvedProblem }) {
  // 수학 과목의 경우 subchapter_name이 "해당없음"이거나 없을 수 있음
  const displayName = problem.subchapter_name && problem.subchapter_name !== '해당없음' 
    ? `${problem.subchapter_name} ${problem.problem_number}`
    : problem.problem_number;

  return (
    <div className="text-center text-sm space-y-1">
      <div className="font-semibold flex items-center justify-center gap-1">
        {displayName}
        {problem.is_curated && (
          <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        )}
      </div>
      <div className="text-xs text-gray-600">
        {problem.textbook_name}
      </div>
      <div className="text-xs text-gray-600">
        {formatDate(problem.last_solved_at)}
      </div>
    </div>
  );
}

export function ProblemInfoDisplay({ 
  problem, 
  index, 
  className, 
  displayValue 
}: ProblemInfoDisplayProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // curated 문제의 점수에 1.2를 곱하고 반올림
  const adjustedDisplayValue = problem.is_curated 
    ? Math.round(displayValue * 1.2)
    : displayValue;

  const content = (
    <div
      className={`w-full aspect-square rounded text-sm flex items-center justify-center font-medium cursor-pointer ${className} relative`}
    >
      {adjustedDisplayValue}
      {problem.is_curated && (
        <div className="absolute top-1 right-1">
          <Circle className="w-2 h-2 text-yellow-500 fill-yellow-500" />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {content}
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <ProblemInfoContent problem={problem} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent>
        <ProblemInfoContent problem={problem} />
      </TooltipContent>
    </Tooltip>
  );
}
