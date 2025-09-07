"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DrawerDialog, DrawerDialogClose } from "@/components/ui/drawerdialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsIcon, Loader2 } from "lucide-react";
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
	const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
	const [totalProblems, setTotalProblems] = useState<number>(10);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const supabase = createClient();

	useEffect(() => {
		loadSubjectData();
	}, []);

	// 사용자 설정 불러오기
	const loadUserSettings = async () => {
		try {
			const response = await fetch(`/api/user-settings/${subjectValue}`);
			
			if (!response.ok) {
				if (response.status === 401) {
					// 인증되지 않은 사용자의 경우 localStorage에서 설정 로드
					loadSettingsFromLocalStorage();
					return;
				}
				throw new Error('설정을 불러오는데 실패했습니다.');
			}

			const data = await response.json();
			
			// 데이터베이스에서 설정 로드
			if (data.isDefault) {
				// 기본값인 경우 설정을 적용하지 않고 기존 기본값 유지
				// (loadSubjectData에서 이미 기본값이 설정됨)
			} else {
				// 사용자가 설정한 값이 있는 경우에만 적용
				setSelectedTextbooks(data.selectedTextbooks || []);
				setSelectedChapters(data.selectedChapters || []);
				setSelectedSubchapters(data.selectedSubchapters || []);
				setSelectedDifficulties(data.selectedDifficulties || ["2", "3"]);
				setTotalProblems(data.totalProblems || 10);
			}

		} catch (error) {
			console.error('사용자 설정 로드 오류:', error);
			// 오류 발생 시 localStorage에서 설정 로드
			loadSettingsFromLocalStorage();
		}
	};

	// localStorage에서 설정 로드 (fallback)
	const loadSettingsFromLocalStorage = () => {
		try {
			const savedSettings = localStorage.getItem(`subject-settings-${subjectValue}`);
			if (savedSettings) {
				const settings = JSON.parse(savedSettings);
				// localStorage에 있는 설정이 유효한 경우에만 적용
				if (settings.selectedTextbooks && settings.selectedTextbooks.length > 0) {
					setSelectedTextbooks(settings.selectedTextbooks);
				}
				if (settings.selectedChapters && settings.selectedChapters.length > 0) {
					setSelectedChapters(settings.selectedChapters);
				}
				if (settings.selectedSubchapters && settings.selectedSubchapters.length > 0) {
					setSelectedSubchapters(settings.selectedSubchapters);
				}
				if (settings.selectedDifficulties && settings.selectedDifficulties.length > 0) {
					setSelectedDifficulties(settings.selectedDifficulties);
				}
				if (settings.totalProblems && settings.totalProblems > 0) {
					setTotalProblems(settings.totalProblems);
				}

				// 인증된 사용자의 경우 localStorage 데이터를 DB로 마이그레이션 시도
				migrateLocalStorageToDatabase(settings);
			}
			// localStorage에 설정이 없으면 기본값 유지 (loadSubjectData에서 이미 설정됨)
		} catch (error) {
			console.error('localStorage 설정 로드 오류:', error);
			// 오류 발생 시 기본값 유지 (loadSubjectData에서 이미 설정됨)
		}
	};

	// localStorage 데이터를 데이터베이스로 마이그레이션
	const migrateLocalStorageToDatabase = async (localSettings: {
		selectedTextbooks?: number[];
		selectedChapters?: number[];
		selectedSubchapters?: number[];
		selectedDifficulties?: string[];
		totalProblems?: number;
	}) => {
		try {
			// 사용자 인증 상태 확인
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			// 이미 DB에 설정이 있는지 확인
			const response = await fetch(`/api/user-settings/${subjectValue}`);
			if (response.ok) {
				const data = await response.json();
				// 기본값이 아닌 경우 (이미 DB에 설정이 있음) 마이그레이션 건너뛰기
				if (!data.isDefault) return;
			}

			// localStorage 설정을 DB로 저장
			const migrateResponse = await fetch(`/api/user-settings/${subjectValue}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					selectedTextbooks: localSettings.selectedTextbooks || [],
					selectedChapters: localSettings.selectedChapters || [],
					selectedSubchapters: localSettings.selectedSubchapters || [],
					selectedDifficulties: localSettings.selectedDifficulties || ["2", "3"],
					totalProblems: localSettings.totalProblems || 10,
				}),
			});

			if (migrateResponse.ok) {
				console.log('localStorage 설정이 데이터베이스로 성공적으로 마이그레이션되었습니다.');
				// 마이그레이션 완료 후 localStorage에서 해당 설정 제거 (선택사항)
				// localStorage.removeItem(`subject-settings-${subjectValue}`);
			}
		} catch (error) {
			console.error('데이터 마이그레이션 오류:', error);
			// 마이그레이션 실패는 치명적이지 않으므로 계속 진행
		}
	};

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
			}

			// 기본값 설정 후 사용자 설정 로드
			if (textbookData && chapterData) {
				// 먼저 기본값 설정 (항상 기본값 먼저 설정)
				const allChapterIds = chapterData.map(c => c.id);
				const allSubchapterIds = chapterData.flatMap((c: Chapter) => 
					c.subchapters?.map((sub: Subchapter) => sub.id) || []
				);
				
				// 기본값 설정
				const defaultTextbooks = textbookData.length > 0 ? [textbookData[0].id] : [];
				const defaultDifficulties = ["2", "3"];
				const defaultProblemCount = 10;
				
				setSelectedTextbooks(defaultTextbooks);
				setSelectedChapters(allChapterIds);
				setSelectedSubchapters(allSubchapterIds);
				setSelectedDifficulties(defaultDifficulties);
				setTotalProblems(defaultProblemCount);
				
				// 사용자 설정 로드 (있으면 기본값 덮어쓰기)
				await loadUserSettings();
			}
		} catch (error) {
			console.error("데이터 로드 오류:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTextbookToggle = (textbookId: number) => {
		setSelectedTextbooks((prev) => {
			// 이미 선택된 교재라면 선택 해제
			if (prev.includes(textbookId)) {
				return prev.filter((id) => id !== textbookId);
			}
			// 새로운 교재 선택 시 기존 선택을 모두 해제하고 새 교재만 선택
			return [textbookId];
		});
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
		setIsSaving(true);
		setSaveError(null);
		setSaveSuccess(false);

		try {
			// 먼저 데이터베이스에 저장 시도
			const response = await fetch(`/api/user-settings/${subjectValue}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					selectedTextbooks,
					selectedChapters,
					selectedSubchapters,
					selectedDifficulties,
					totalProblems,
				}),
			});

			if (!response.ok) {
				if (response.status === 401) {
					// 인증되지 않은 사용자의 경우 localStorage에만 저장
					saveToLocalStorage();
					setSaveSuccess(true);
					return;
				}
				const errorData = await response.json();
				throw new Error(errorData.error || '설정 저장에 실패했습니다.');
			}

			const data = await response.json();
			console.log('설정 저장 성공:', data.message);
			
			// 성공적으로 저장된 경우 localStorage에도 백업
			saveToLocalStorage();
			setSaveSuccess(true);

		} catch (error) {
			console.error('설정 저장 오류:', error);
			setSaveError(error instanceof Error ? error.message : '설정 저장 중 오류가 발생했습니다.');
			
			// 데이터베이스 저장 실패 시 localStorage에라도 저장
			saveToLocalStorage();
		} finally {
			setIsSaving(false);
			// 3초 후 성공/오류 메시지 숨기기
			setTimeout(() => {
				setSaveSuccess(false);
				setSaveError(null);
			}, 3000);
		}
	};

	// localStorage에 설정 저장 (백업용)
	const saveToLocalStorage = () => {
		try {
			const settings = {
				subjectValue,
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
		} catch (error) {
			console.error('localStorage 저장 오류:', error);
		}
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
				<div className="space-y-3">

					<DrawerDialogClose 
						variant="default" 
						size="lg" 
						className="w-full rounded-full" 
						onClick={handleSaveSettings}
						disabled={isSaving}
					>
						{isSaving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								저장 중...
							</>
						) : (
							'설정 저장'
						)}
					</DrawerDialogClose>
				</div>
			}
		>
			<div className="space-y-6 px-4 min-h-[400px]">
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
