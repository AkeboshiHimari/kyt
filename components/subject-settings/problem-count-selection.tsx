"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import NumberFlow from "@number-flow/react";

interface ProblemCountSelectionProps {
	totalProblems: number;
	onProblemCountChange: (count: number) => void;
}

export function ProblemCountSelection({
	totalProblems,
	onProblemCountChange,
}: ProblemCountSelectionProps) {
	const increment = () => onProblemCountChange(Math.min(20, totalProblems + 1));
	const decrement = () => onProblemCountChange(Math.max(1, totalProblems - 1));

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Label className="text-base font-medium">총 문제 수</Label>
				<div className="text-sm text-muted-foreground">
					1 ~ 20 문제까지 설정 가능
				</div>
			</div>
			
			<div className="flex items-center justify-center gap-4">
				<Button
					variant="outline"
					size="lg"
					onClick={decrement}
					disabled={totalProblems <= 1}
					className="h-12 w-12 rounded-full p-0"
				>
					<Minus className="h-5 w-5" />
				</Button>
				
				<div className="flex items-center justify-center min-w-[120px] h-16 bg-muted/50 rounded-lg border">
					<NumberFlow 
						value={totalProblems} 
						format={{ style: 'decimal' }}
						className="text-2xl font-bold"
					/>
					<span className="text-sm text-muted-foreground ml-1">문제</span>
				</div>
				
				<Button
					variant="outline"
					size="lg"
					onClick={increment}
					disabled={totalProblems >= 20}
					className="h-12 w-12 rounded-full p-0"
				>
					<Plus className="h-5 w-5" />
				</Button>
			</div>
			
			<div className="flex justify-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onProblemCountChange(10)}
					className="text-xs"
				>
					10문제
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onProblemCountChange(20)}
					className="text-xs"
				>
					20문제
				</Button>
			</div>
		</div>
	);
}
