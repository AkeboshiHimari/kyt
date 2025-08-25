"use client";

import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";

interface DifficultySelectionProps {
	selectedDifficulties: string[];
	onDifficultyChange: (difficulties: string[]) => void;
}

export function DifficultySelection({
	selectedDifficulties,
	onDifficultyChange,
}: DifficultySelectionProps) {
	const difficulties = [
		{ value: "0", label: "기본" },
		{ value: "1", label: "쉬움" },
		{ value: "2", label: "보통" },
		{ value: "3", label: "어려움" }
	];

	const handleToggle = (value: string, pressed: boolean) => {
		if (pressed) {
			onDifficultyChange([...selectedDifficulties, value]);
		} else {
			onDifficultyChange(selectedDifficulties.filter(d => d !== value));
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Label className="text-base font-medium">난이도 선택</Label>
				<div className="text-sm text-muted-foreground">
					원하는 난이도를 선택하세요 (다중 선택 가능)
				</div>
			</div>
			
			<div className="grid grid-cols-4 gap-3 w-full">
				{difficulties.map((difficulty) => (
					<Toggle
						key={difficulty.value}
						pressed={selectedDifficulties.includes(difficulty.value)}
						onPressedChange={(pressed) => handleToggle(difficulty.value, pressed)}
						variant="outline"
						className="w-full flex-col justify-start h-auto p-4 bg-card border hover:bg-muted/50 data-[state=on]:bg-primary/10 data-[state=on]:border-primary/50 data-[state=on]:text-primary"
					>
						<span className="text-lg font-bold">{difficulty.value}</span>
						<span className="text-xs text-muted-foreground">{difficulty.label}</span>
					</Toggle>
				))}
			</div>
			
			{selectedDifficulties.length === 0 && (
				<div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
					최소 하나의 난이도를 선택해주세요.
				</div>
			)}
		</div>
	);
}
