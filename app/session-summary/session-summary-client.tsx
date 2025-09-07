"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrawerDialog } from "@/components/ui/drawerdialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeIcon, FileTextIcon } from "lucide-react";
import { RatingDisplay } from "./rating-display";
import { AccuracyDisplay } from "./accuracy-display";
import { SessionProblemList } from "./session-problem-list";
import { SessionIntro } from "./session-intro";
import { TierPromotion, hasTierPromotion } from "./tier-promotion";
import type { SessionSummaryData } from "./page";

interface Props {
	summaryData: SessionSummaryData;
}

export function SessionSummaryClient({ summaryData }: Props) {
	const router = useRouter();
	const [showIntro, setShowIntro] = useState(true);
	const [showTierPromotion, setShowTierPromotion] = useState(false);
	const [animationStep, setAnimationStep] = useState<'intro' | 'score' | 'results' | 'complete'>('intro');
	
	// 티어 승급 확인 (메모이제이션)
	const hasPromotion = useMemo(() => 
		hasTierPromotion(summaryData.previousRating, summaryData.newRating),
		[summaryData.previousRating, summaryData.newRating]
	);

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}분 ${remainingSeconds}초`;
	};

	const goToHome = () => {
		router.push("/");
	};

	const goToMenu = () => {
		router.push("/menu");
	};

	const handleIntroComplete = () => {
		setShowIntro(false);
		// 인트로 완료 후 바로 점수 애니메이션 시작
		setAnimationStep('score');
	};

	const handleTierPromotionComplete = useCallback(() => {
		setShowTierPromotion(false);
	}, []);

	return (
		<>
			<AnimatePresence>
				{showIntro && <SessionIntro onComplete={handleIntroComplete} />}
				{showTierPromotion && (
					<TierPromotion 
						previousRating={summaryData.previousRating}
						newRating={summaryData.newRating}
						onComplete={handleTierPromotionComplete}
						key="tier-promotion" // 고유 key 추가로 재마운팅 방지
					/>
				)}
			</AnimatePresence>

			<motion.div
				className="flex flex-col h-full px-6 xl:px-8 py-8"
				initial={{ opacity: 0, y: 20 }}
				animate={{ 
					opacity: (showIntro || showTierPromotion) ? 0 : 1, 
					y: (showIntro || showTierPromotion) ? 20 : 0 
				}}
				transition={{ duration: 0.5, delay: (showIntro || showTierPromotion) ? 0 : 0.3 }}
			>
				{/* 헤더 */}
				<div className="flex flex-col items-center gap-2 mb-12">
					<h1 className="text-3xl font-medium"> {summaryData.subjectName}</h1>
					<div className="flex items-center gap-4">
						<p className="text-xl text-muted-foreground">
							{formatTime(summaryData.elapsedSeconds)}
						</p>
					</div>
				</div>

				{/* 메인 결과 */}
				<div className="flex-1 flex flex-col items-center gap-8">
				{/* 정답률 */}
				<AccuracyDisplay
					accuracy={summaryData.accuracy}
					correctAnswers={summaryData.correctAnswers}
					totalProblems={summaryData.totalProblems}
					partialAnswers={summaryData.partialAnswers}
					animationStep={animationStep}
					onAnimationComplete={() => {
						// score 애니메이션 완료 후 rating과 rank 즉시 시작
						setAnimationStep('results');
					}}
				/>

					{/* 레이팅 변화 */}
					<RatingDisplay
						previousRating={summaryData.previousRating}
						newRating={summaryData.newRating}
						ratingIncrease={summaryData.ratingIncrease}
						animationStep={animationStep}
						onAnimationComplete={useCallback(() => {
							// 레이팅 애니메이션 완료 후 승급이 있으면 승급 화면 표시
							if (hasPromotion) {
								setShowTierPromotion(true);
							}
						}, [hasPromotion])}
					/>

				</div>

				{/* 하단 버튼 */}
				<div className="flex justify-center gap-4 mt-12">
					<Button onClick={goToHome} className="rounded-full">
						<HomeIcon className="w-4 h-4 mr-2" />
						홈으로
					</Button>
					
					{/* 결과 상세 버튼 (DrawerDialog) */}
					{summaryData.problemHistory && summaryData.problemHistory.length > 0 && (
						<DrawerDialog
							trigger={
								<Button variant="outline" className="rounded-full">
									<FileTextIcon className="w-4 h-4 mr-2" />
									결과 상세
								</Button>
							}
							title="세션 결과 상세"
						>
							<ScrollArea className="h-[400px] px-4 pb-4">
								<SessionProblemList problems={summaryData.problemHistory} />
							</ScrollArea>
						</DrawerDialog>
					)}
				</div>
			</motion.div>
		</>
	);
}
