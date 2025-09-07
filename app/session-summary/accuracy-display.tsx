"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { RankDisplay } from "./rank-display";

interface Props {
	accuracy: number;
	correctAnswers: number;
	totalProblems: number;
	partialAnswers: number;
	animationStep: "intro" | "score" | "results" | "complete";
	onAnimationComplete?: () => void;
}

export function AccuracyDisplay({
	accuracy,
	correctAnswers,
	totalProblems,
	partialAnswers,
	animationStep,
	onAnimationComplete,
}: Props) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		if (animationStep === "score") {
			// score 애니메이션 단계에서만 NumberFlow 애니메이션 시작
			const timer = setTimeout(() => {
				setDisplayValue(Math.round(accuracy * 10000));
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [animationStep, accuracy]);

	return (
		<div className="flex flex-col items-center gap-4">
			{/* 랭크 */}
			<RankDisplay accuracy={accuracy} animationStep={animationStep} />
			<div className="text-center">
				<div className="text-6xl mb-4">
					<NumberFlow
						value={displayValue}
						onAnimationsFinish={() => {
							// NumberFlow 애니메이션 완료 시 콜백 호출
							if (animationStep === "score") {
								onAnimationComplete?.();
							}
						}}
					/>

				</div>
			</div>
		</div>
	);
}
