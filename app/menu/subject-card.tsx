'use client'

import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { SubjectSettings } from "./subject-settings";

interface SubjectCardProps {
	title: string;
	value: string;
}

export function SubjectCard({ title, value }: SubjectCardProps) {
	const handleStart = () => {
		// 현재 설정값을 problemFilters로 변환하여 저장
		const subjectSettings = localStorage.getItem(`subject-settings-${value}`)
		if (subjectSettings) {
			const settings = JSON.parse(subjectSettings)
			const difficultyNumbers = settings.selectedDifficulties?.map((d: string) => Number.parseInt(d, 10)) || [2, 3]
			const problemFilters = {
				subjects: settings.subjectId ? [settings.subjectId] : [],
				textbooks: settings.selectedTextbooks || [],
				chapters: settings.selectedChapters || [],
				subchapters: settings.selectedSubchapters || [],
				difficultyRange: [Math.min(...difficultyNumbers), Math.max(...difficultyNumbers)],
				totalProblems: settings.totalProblems || 10
			}
			localStorage.setItem('problemFilters', JSON.stringify(problemFilters))
		}
		
		// 문제 페이지로 이동
		window.location.href = `/${value}/problems`
	}

	return (
		<div className="flex flex gap-2">
			<Button
				variant="default"
				size="lg"
				className="rounded-full gap-2"
				onClick={handleStart}
			>
				<PlayIcon className="size-4" />
				<span className="text-lg">시작</span>
			</Button>
			<SubjectSettings subjectValue={value} subjectTitle={title} />
		</div>
	);
}
