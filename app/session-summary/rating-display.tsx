"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { TierBadge } from "@/components/ui/tier-badge";

interface Props {
	previousRating: number;
	newRating: number;
	ratingIncrease: number;
	animationStep: 'intro' | 'score' | 'results' | 'complete';
	onAnimationComplete?: () => void;
}

export function RatingDisplay({
	previousRating,
	newRating,
	ratingIncrease,
	animationStep,
	onAnimationComplete,
}: Props) {
	const [displayValue, setDisplayValue] = useState(previousRating);
	const [showRating, setShowRating] = useState(false);

	useEffect(() => {
		if (animationStep === 'results') {
			// results 애니메이션 단계에서만 표시 및 NumberFlow 애니메이션 시작 (rank와 동시에)
			setShowRating(true);
			const timer = setTimeout(() => {
				setDisplayValue(newRating);
				// NumberFlow 애니메이션 완료 후 잠시 대기 후 콜백 호출
				const completeTimer = setTimeout(() => {
					onAnimationComplete?.();
				}, 1500); // NumberFlow 애니메이션 시간 + 약간의 여유
				
				return () => clearTimeout(completeTimer);
			}, 200);

			return () => clearTimeout(timer);
		}
	}, [animationStep, newRating, onAnimationComplete]);

	return (
		<div className="text-center">
			{/* 영역 미리 예약 */}
			<div className="h-20 flex flex-col justify-center">
				{showRating && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, ease: "easeOut" }}
					>
						<div className="text-2xl mb-3">과목 레이팅</div>
						<div className="flex items-center justify-center gap-4">
							<TierBadge 
								rating={displayValue} 
								size="medium" 
								showRank={true} 
								showGlow={true} 
							/>
							<div className="flex flex-col items-center">
								<div className="text-4xl">
									<NumberFlow 
										value={displayValue} 
										className="text-primary"
									/>
								</div>
								{ratingIncrease > 0 && (
									<div className="text-lg text-muted-foreground font-semibold">+{ratingIncrease}</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
