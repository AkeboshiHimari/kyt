"use client";

import { useState, useMemo } from "react";
import { RatingOverview } from "@/components/profile/rating-overview";
import { MasteryStats } from "@/components/profile/mastery-stats";
import { ActivityStreak } from "@/components/profile/activity-streak";
import { WrongProblems } from "@/components/profile/wrong-problems";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import type { TopSolvedProblem, SubjectBreakdown } from "@/lib/profile-data";
import type { Profile } from "@/lib/db-types";

// 유틸리티 함수를 컴포넌트 외부로 이동
const getSubjectName = (subjectId: number): string => {
	switch (subjectId) {
		case 1:
			return "일반물리학";
		case 2:
			return "미분적분학";
		case 3:
			return "선형대수학";
		default:
			return "";
	}
};

interface MasteryItem {
	scope_type: "subject" | "chapter" | "subchapter" | "problem_type";
	scope_id: number;
	rating: number;
	scope_name: string;
	parent_subject?: string;
	parent_chapter?: string;
	parent_subchapter?: string;
}

interface ActivityData {
	date: string;
	problems_solved: number;
}

interface WrongProblem {
	id: number;
	problem_number: string;
	page_number: number | null;
	difficulty: number | null;
	problem_type_name: string;
	subchapter_name: string;
	chapter_name: string;
	subject_name: string;
	textbook_name: string;
	status: "incorrect" | "partial";
	submitted_at: string;
}

interface ProfileClientProps {
	user: User;
	profile: Profile | null;
	totalRating: number;
	solvingScore: number;
	problemCountBonus: number;
	masteryBonus: number;
	solvedProblemCount: number;
	masteryData: MasteryItem[];
	activityData: ActivityData[];
	wrongProblems: WrongProblem[];
	topSolvedProblems: TopSolvedProblem[];
	subjectBreakdowns: SubjectBreakdown[];
	allSubjectTopProblems: { [subjectId: number]: TopSolvedProblem[] };
}

export function ProfileClient({
	user,
	profile,
	totalRating,
	solvingScore,
	problemCountBonus,
	masteryBonus,
	solvedProblemCount,
	masteryData,
	activityData,
	wrongProblems,
	topSolvedProblems,
	subjectBreakdowns,
	allSubjectTopProblems,
}: ProfileClientProps) {
	const [selectedSubject, setSelectedSubject] = useState<
		"all" | "physics" | "calculus" | "linear-algebra"
	>("all");

	// 과목별 데이터 필터링
	const subjectMapping = {
		physics: 1,
		calculus: 2,
		"linear-algebra": 3,
	};

	const filteredData = useMemo(() => {
		if (selectedSubject === "all") {
			return {
				masteryData,
				wrongProblems,
				topSolvedProblems: topSolvedProblems,
				subjectRating: totalRating,
				solvingScore,
				problemCountBonus,
				masteryBonus,
				solvedProblemCount,
			};
		}

		const subjectId = subjectMapping[selectedSubject];

		// 선택된 과목의 breakdown 찾기
		const subjectBreakdown = subjectBreakdowns.find(
			(breakdown) => breakdown.subjectId === subjectId,
		);

		return {
			masteryData: masteryData.filter((item) => {
				if (item.scope_type === "subject") return item.scope_id === subjectId;
				// 상위 과목으로 필터링
				return item.parent_subject === getSubjectName(subjectId);
			}),
			wrongProblems: wrongProblems.filter(
				(problem) => problem.subject_name === getSubjectName(subjectId),
			),
			topSolvedProblems: allSubjectTopProblems[subjectId] || [],
			subjectRating: subjectBreakdown?.totalRating || 0,
			solvingScore: subjectBreakdown?.solvingScore || 0,
			problemCountBonus: subjectBreakdown?.problemCountBonus || 0,
			masteryBonus: subjectBreakdown?.masteryBonus || 0,
			solvedProblemCount: subjectBreakdown?.solvedProblemCount || 0,
		};
	}, [
		selectedSubject,
		masteryData,
		wrongProblems,
		topSolvedProblems,
		totalRating,
		solvingScore,
		problemCountBonus,
		masteryBonus,
		solvedProblemCount,
		subjectBreakdowns,
	]);

	return (
		<div className="flex flex-col h-full px-6 xl:px-8 py-4">
			<div className="mb-8">
        <div className="flex flex-col gap-2 mb-2">
				<h1 className="text-3xl">
					{profile?.nickname || "닉네임 미설정"}
				</h1>
				<p className="text-muted-foreground">UID: {user.id.slice(-6)}</p>
        </div>
				{/* 과목 선택 버튼들 */}
				<div className="flex gap-1 mt-6">
					<Button
						variant={selectedSubject === "all" ? "default" : "ghost"}
						size="sm"
						className="rounded-full"
						onClick={() => setSelectedSubject("all")}
					>
						전체
					</Button>
					<Button
						variant={selectedSubject === "physics" ? "default" : "ghost"}
						size="sm"
						className="rounded-full"
						onClick={() => setSelectedSubject("physics")}
					>
						일반물리학
					</Button>
					<Button
						variant={selectedSubject === "calculus" ? "default" : "ghost"}
						size="sm"
						className="rounded-full"
						onClick={() => setSelectedSubject("calculus")}
					>
						미분적분학
					</Button>
					<Button
						variant={selectedSubject === "linear-algebra" ? "default" : "ghost"}
						size="sm"
						className="rounded-full"
						onClick={() => setSelectedSubject("linear-algebra")}
					>
						선형대수학
					</Button>
				</div>
			</div>

			<div className="space-y-12">
				{/* 레이팅 개요 */}
				<section className="mt-4">
					<RatingOverview
						totalRating={filteredData.subjectRating}
						solvingScore={filteredData.solvingScore}
						problemCountBonus={filteredData.problemCountBonus}
						masteryBonus={filteredData.masteryBonus}
						solvedProblemCount={filteredData.solvedProblemCount}
						topSolvedProblems={filteredData.topSolvedProblems}
					/>
				</section>

				{/* 과목별 숙련도 */}
				<section>
					<MasteryStats masteryData={filteredData.masteryData} />
				</section>

				{/* 활동 기록 - 전체 과목 통합 */}
				<section>
					<ActivityStreak activityData={activityData} />
				</section>

				{/* 오답노트 */}
				<section>
					<WrongProblems wrongProblems={filteredData.wrongProblems} />
				</section>
			</div>
		</div>
	);
}
