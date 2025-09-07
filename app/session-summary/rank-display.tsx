"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCircularProgressBar } from "@/components/imported/magicui/animated-circular-progress-bar";
import NumberFlow from "@number-flow/react";

interface Props {
	accuracy: number;
	animationStep: 'intro' | 'score' | 'results' | 'complete';
}

// 정확도에 따른 랭크 계산
function calculateRank(accuracy: number): {
	rank: string;
	backgroundImage?: string;
	backgroundColor?: string;
	textColor: string;
} {
	const percentage = accuracy;

	if (percentage >= 97) {
		return {
			rank: "S",
			backgroundImage: "linear-gradient(135deg, rgb(255 215 0), rgb(255 193 7), rgb(255 235 59))", // 금색 그레이디언트
			textColor: "rgb(255 255 255)", // 흰색 텍스트
		};
	}

	if (percentage >= 90) {
		return {
			rank: "A",
			backgroundImage: "linear-gradient(135deg, rgb(169 169 169), rgb(192 192 192), rgb(211 211 211))", // 은색 그레이디언트 (어둡게)
			textColor: "rgb(255 255 255)", // 흰색 텍스트
		};
	}

	if (percentage >= 80) {
		return {
			rank: "B",
			backgroundImage: "linear-gradient(135deg, rgb(205 127 50), rgb(222 184 135), rgb(244 164 96))", // 동색 그레이디언트
			textColor: "rgb(255 255 255)", // 흰색 텍스트
		};
	}

	return {
		rank: "C",
		backgroundColor: "rgb(107 114 128)", // 단색 회색
		textColor: "rgb(255 255 255)", // 흰색 텍스트
	};
}

export function RankDisplay({ accuracy, animationStep }: Props) {
	const [value, setValue] = useState(0);
	const [showRank, setShowRank] = useState(false);
	const { rank, backgroundImage, backgroundColor, textColor } = calculateRank(accuracy);

	useEffect(() => {
		if (animationStep === 'results') {
			// results 애니메이션 단계에서만 표시 (rating과 동시에)
			const timer = setTimeout(() => {
				setShowRank(true);
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [animationStep]);

	return (
		<div className="text-center flex flex-col items-center gap-4">
			<div className="w-28 h-18 flex items-center justify-center">
				{showRank && (
					<motion.div 
						className="text-5xl font-bold w-28 h-18 flex items-center justify-center"
						style={{ 
							backgroundImage,
							backgroundColor,
							color: textColor,
							transform: "skew(-5deg)",
							clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)"
						}}
						initial={{ 
							scale: 0.3,
							opacity: 0
						}}
						animate={{ 
							scale: 1,
							opacity: 1
						}}
						transition={{
							type: "spring",
							damping: 20,
							stiffness: 400,
							duration: 0.4
						}}
					>
						<span>
							{rank}
						</span>
					</motion.div>
				)}
			</div>
		</div>
	);
}
