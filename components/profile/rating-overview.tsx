import { TierBadge, getTierInfoUtil } from "@/components/ui/tier-badge";
import { ProblemInfoDisplay } from "./problem-info-display";
import type { TopSolvedProblem } from "@/lib/profile-data";

interface RatingOverviewProps {
	totalRating: number;
	solvingScore: number;
	problemCountBonus: number;
	masteryBonus: number;
	solvedProblemCount: number;
	topSolvedProblems: TopSolvedProblem[];
}

// 난이도에 따른 색상 결정 (난이도 3: 검은색, 난이도 0: 흰색)
function getDifficultyColor(difficulty: number) {
	switch (difficulty) {
		case 3:
			return "bg-gray-900 text-white"; // 검은색
		case 2:
			return "bg-gray-600 text-white"; // 진한 회색
		case 1:
			return "bg-gray-400 text-gray-900"; // 중간 회색
		default:
			return "bg-gray-100 text-gray-900 border border-gray-300"; // 흰색 (난이도 0)
	}
}

// 다음 티어까지의 진행률 계산
function getTierProgress(rating: number) {
	if (rating >= 1000) {
		return {
			currentTierName: "Master",
			nextTierName: null,
			progress: 100,
			currentRating: rating,
			nextTierRating: null,
			progressBarColor: "from-purple-500 to-pink-500",
		};
	}

	const tiers = [
		{ name: "Bronze", min: 0, max: 199, color: "from-amber-600 to-orange-700" },
		{ name: "Silver", min: 200, max: 399, color: "from-gray-400 to-gray-600" },
		{
			name: "Gold",
			min: 400,
			max: 599,
			color: "from-yellow-400 to-yellow-600",
		},
		{
			name: "Platinum",
			min: 600,
			max: 799,
			color: "from-cyan-400 to-cyan-600",
		},
		{ name: "Diamond", min: 800, max: 999, color: "from-blue-500 to-blue-700" },
	];

	for (let i = 0; i < tiers.length; i++) {
		const tier = tiers[i];
		if (rating >= tier.min && rating <= tier.max) {
			const nextTier =
				i < tiers.length - 1
					? tiers[i + 1]
					: { name: "Master", min: 1000, color: "from-purple-500 to-pink-500" };
			const progress = ((rating - tier.min) / (nextTier.min - tier.min)) * 100;

			return {
				currentTierName: tier.name,
				nextTierName: nextTier.name,
				progress: Math.min(progress, 100),
				currentRating: rating,
				nextTierRating: nextTier.min,
				progressBarColor: tier.color,
			};
		}
	}

	// Bronze 이하인 경우
	return {
		currentTierName: "Bronze",
		nextTierName: "Silver",
		progress: (rating / 200) * 100,
		currentRating: rating,
		nextTierRating: 200,
		progressBarColor: "from-amber-600 to-orange-700",
	};
}

export function RatingOverview({
	totalRating,
	solvingScore,
	problemCountBonus,
	masteryBonus,
	solvedProblemCount,
	topSolvedProblems,
}: RatingOverviewProps) {
	const tierInfo = getTierInfoUtil(totalRating);
	const progressInfo = getTierProgress(totalRating);

	return (
		<div className="space-y-12">
			<div className="text-left flex items-center gap-4 ml-4">
				<TierBadge
					rating={totalRating}
					size="large"
					showRank={true}
					showGlow={true}
				/>

				<div className="flex flex-col flex-1 ml-4">
					<div className="flex gap-2 items-center">
						<h1 className="text-2xl">{tierInfo.tier} {tierInfo.rank}</h1>
						<h1 className="text-2xl font-bold">{totalRating}</h1>
					</div>

					{/* 다음 티어까지의 진행률 */}
					{progressInfo.nextTierName && (
						<div className="mt-3 space-y-2">
							<div className="w-full bg-gray-200 rounded-full h-4">
								<div
									className={`h-4 rounded-full bg-gradient-to-r ${progressInfo.progressBarColor} transition-all duration-500 ease-out`}
									style={{ width: `${progressInfo.progress}%` }}
								/>
							</div>
							<div className="text-sm text-muted-foreground text-right">
								{progressInfo.nextTierName} 까지 -
								{progressInfo.nextTierRating - progressInfo.currentRating}
							</div>
						</div>
					)}

					{/* Master 티어인 경우 */}
					{!progressInfo.nextTierName && (
						<div className="mt-3 space-y-2">
							<div className="w-full bg-gray-200 rounded-full h-4">
								<div
									className={`h-4 rounded-full bg-gradient-to-r ${progressInfo.progressBarColor} animate-pulse`}
									style={{ width: "100%" }}
								/>
							</div>
							<div className="text-sm text-muted-foreground text-right">최고 티어 달성!</div>
						</div>
					)}
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<span className="text-gray-600">문제해결 점수</span>
					<span className="font-medium">{solvingScore}</span>
				</div>

				{/* 상위 75개 해결한 문제들 시각화 */}
				{topSolvedProblems.length > 0 && (
					<div className="mt-4 space-y-2">
						<div className="text-xs sm:text-sm text-gray-600">
							상위 75개 해결한 문제 (어려운 순 → 최근 순)
						</div>
						<div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-20 xl:grid-cols-25 gap-0.5 sm:gap-1">
							{topSolvedProblems.map((problem, index) => (
								<ProblemInfoDisplay
									key={`${problem.problem_id}-${index}`}
									problem={problem}
									index={index}
									className={getDifficultyColor(problem.difficulty)}
									displayValue={
										problem.difficulty === 0
											? 1
											: problem.difficulty === 1
												? 3
												: problem.difficulty === 2
													? 8
													: 20
									}
								/>
							))}
							{/* 75개보다 적을 경우 빈 칸으로 채우기 */}
							{Array.from(
								{ length: Math.max(0, 75 - topSolvedProblems.length) },
								(_, index) => (
									<div
										key={`empty-${topSolvedProblems.length + index}`}
										className="aspect-square rounded bg-gray-50 border border-gray-200"
									/>
								),
							)}
						</div>
						<div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
							<span>쉬움</span>
							<div className="flex space-x-1">
								<div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-100 border border-gray-300" />
								<div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-400" />
								<div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-600" />
								<div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-900" />
							</div>
							<span>어려움</span>
						</div>
					</div>
				)}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">푼 문제 수 보너스</span>
					<span className="font-medium">
						+{problemCountBonus}{" "}
						<span className="text-sm text-gray-500">
							({solvedProblemCount}문제)
						</span>
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-gray-600">숙련도 보너스</span>
					<span className="font-medium">+{masteryBonus}</span>
				</div>
				<hr className="my-3" />
				<div className="flex justify-between items-center font-semibold">
					<span>총 점수</span>
					<span>{totalRating}</span>
				</div>
			</div>
		</div>
	);
}
