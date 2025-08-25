"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DrawerDialog, DrawerDialogClose } from "@/components/ui/drawerdialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { TextbookSelection } from "../../components/subject-settings/textbook-selection";
import { ChapterSelection } from "../../components/subject-settings/chapter-selection";
import { DifficultySelection } from "../../components/subject-settings/difficulty-selection";
import { ProblemCountSelection } from "../../components/subject-settings/problem-count-selection";

interface SubjectSettingsProps {
	subjectValue: string;
	subjectTitle: string;
}

interface Textbook {
	id: number;
	textbook_name: string;
	textbook_abbreviation: string;
}

interface Chapter {
	id: number;
	chapter_number: number;
	chapter_name: string;
	subchapters: Subchapter[];
}

interface Subchapter {
	id: number;
	subchapter_number: string;
	subchapter_name: string;
}

import { SUBJECT_NAME_MAPPING } from "@/lib/filter-utils";

export function SubjectSettings({
	subjectValue,
	subjectTitle,
}: SubjectSettingsProps) {
	const [textbooks, setTextbooks] = useState<Textbook[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [selectedTextbooks, setSelectedTextbooks] = useState<number[]>([]);
	const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
	const [selectedSubchapters, setSelectedSubchapters] = useState<number[]>([]);
	const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(["2", "3"]);
	const [totalProblems, setTotalProblems] = useState<number>(10);
	const [isLoading, setIsLoading] = useState(false);

	const supabase = createClient();

	useEffect(() => {
		loadSubjectData();
	}, []);

	const loadSubjectData = async () => {
		setIsLoading(true);
		try {
			const actualSubjectName = SUBJECT_NAME_MAPPING[subjectValue] || subjectTitle;

			const { data: subjectData } = await supabase
				.from("subjects")
				.select("id")
				.eq("subject_name", actualSubjectName)
				.single();

			if (!subjectData) {
				console.error("과목을 찾을 수 없습니다:", actualSubjectName);
				return;
			}

			const subjectId = subjectData.id;

			// 교재 목록 가져오기
			const { data: textbookData } = await supabase
				.from("textbooks")
				.select("*")
				.eq("subject_id", subjectId);

			if (textbookData) {
				setTextbooks(textbookData);
				// 기본적으로 모든 교재 선택
				setSelectedTextbooks(textbookData.map(t => t.id));
			}

			// 챕터 목록 가져오기 (서브챕터 포함)
			const { data: chapterData } = await supabase
				.from("chapters")
				.select(`
          *,
          subchapters (*)
        `)
				.eq("subject_id", subjectId)
				.order("chapter_number");

			if (chapterData) {
				setChapters(chapterData);
				// 기본적으로 모든 챕터와 서브챕터 선택
				const allChapterIds = chapterData.map(c => c.id);
				const allSubchapterIds = chapterData.flatMap((c: Chapter) => 
					c.subchapters?.map((sub: Subchapter) => sub.id) || []
				);
				setSelectedChapters(allChapterIds);
				setSelectedSubchapters(allSubchapterIds);
			}
		} catch (error) {
			console.error("데이터 로드 오류:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTextbookToggle = (textbookId: number) => {
		setSelectedTextbooks((prev) =>
			prev.includes(textbookId)
				? prev.filter((id) => id !== textbookId)
				: [...prev, textbookId],
		);
	};

	const handleChapterToggleWithSubchapters = (chapterId: number) => {
		const chapter = chapters.find((c) => c.id === chapterId);
		if (!chapter) return;

		const isSelected = selectedChapters.includes(chapterId);
		
		if (isSelected) {
			// 챕터 해제 시 해당 챕터의 모든 서브챕터도 해제
			setSelectedChapters((prev) => prev.filter((id) => id !== chapterId));
			setSelectedSubchapters((prev) => 
				prev.filter((id) => !chapter.subchapters?.some(sub => sub.id === id))
			);
		} else {
			// 챕터 선택 시 해당 챕터의 모든 서브챕터도 선택
			setSelectedChapters((prev) => [...prev, chapterId]);
			if (chapter.subchapters) {
				const subchapterIds = chapter.subchapters.map((sub) => sub.id);
				setSelectedSubchapters((prev) => [...prev, ...subchapterIds]);
			}
		}
	};

	const handleSubchapterToggle = (subchapterId: number) => {
		setSelectedSubchapters((prev) =>
			prev.includes(subchapterId)
				? prev.filter((id) => id !== subchapterId)
				: [...prev, subchapterId],
		);
	};

	const handleSelectAll = () => {
		const allChapterIds = chapters.map((chapter) => chapter.id);
		const allSubchapterIds = chapters.flatMap((chapter) => 
			chapter.subchapters?.map((sub) => sub.id) || []
		);
		
		if (selectedChapters.length === chapters.length) {
			// 전체 해제
			setSelectedChapters([]);
			setSelectedSubchapters([]);
		} else {
			// 전체 선택
			setSelectedChapters(allChapterIds);
			setSelectedSubchapters(allSubchapterIds);
		}
	};

	const handleSaveSettings = async () => {
		// 과목 ID 찾기
		const actualSubjectName = SUBJECT_NAME_MAPPING[subjectValue] || subjectTitle;
		const { data: subjectData } = await supabase
			.from("subjects")
			.select("id")
			.eq("subject_name", actualSubjectName)
			.single();

		const settings = {
			subjectValue,
			subjectId: subjectData?.id,
			selectedTextbooks,
			selectedChapters,
			selectedSubchapters,
			selectedDifficulties,
			totalProblems,
		};

		localStorage.setItem(
			`subject-settings-${subjectValue}`,
			JSON.stringify(settings),
		);
	};

	if (isLoading) {
		return (
			<DrawerDialog
				trigger={
					<Button variant="ghost" size="lg" className="rounded-full gap-2">
						<SettingsIcon className="size-4" />
					</Button>
				}
				title={`${subjectTitle} 설정`}
				description="데이터를 불러오는 중..."
			>
				<div className="flex items-center justify-center py-8">
					<div className="text-muted-foreground">로딩 중...</div>
				</div>
			</DrawerDialog>
		);
	}

	return (
		<DrawerDialog
			trigger={
				<Button variant="ghost" size="lg" className="rounded-full gap-2">
					<SettingsIcon className="size-4" />
				</Button>
			}
			title={`${subjectTitle} 설정`}
			description="문제 출제 범위와 난이도를 설정하세요"
			footer={
				<div>
					<DrawerDialogClose variant="default" size="lg" className="w-full rounded-full" onClick={handleSaveSettings}>
						설정 저장
					</DrawerDialogClose>
				</div>
			}
		>
			<div className="space-y-6 px-4 min-h-[450px]">
				<Tabs defaultValue="textbook" className="w-full">
					<TabsList className="gap-1 bg-transparent">
						<TabsTrigger
							value="textbook"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
						>
							교재
						</TabsTrigger>
						<TabsTrigger
							value="chapters"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
						>
							출제범위
						</TabsTrigger>
						<TabsTrigger
							value="difficulty"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
						>
							난이도
						</TabsTrigger>
						<TabsTrigger
							value="count"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
						>
							문제 수
						</TabsTrigger>
					</TabsList>

					<TabsContent value="textbook" className="space-y-6 min-h-[300px]">
						<TextbookSelection
							textbooks={textbooks}
							selectedTextbooks={selectedTextbooks}
							onTextbookToggle={handleTextbookToggle}
						/>
					</TabsContent>

					<TabsContent value="chapters" className="space-y-4 min-h-[300px]">
						<ChapterSelection
							chapters={chapters}
							selectedChapters={selectedChapters}
							selectedSubchapters={selectedSubchapters}
							onChapterToggle={handleChapterToggleWithSubchapters}
							onSubchapterToggle={handleSubchapterToggle}
							onSelectAll={handleSelectAll}
						/>
					</TabsContent>

					<TabsContent value="difficulty" className="space-y-6 min-h-[300px]">
						<DifficultySelection
							selectedDifficulties={selectedDifficulties}
							onDifficultyChange={setSelectedDifficulties}
						/>
					</TabsContent>

					<TabsContent value="count" className="space-y-6 min-h-[300px]">
						<ProblemCountSelection
							totalProblems={totalProblems}
							onProblemCountChange={setTotalProblems}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</DrawerDialog>
	);
}
