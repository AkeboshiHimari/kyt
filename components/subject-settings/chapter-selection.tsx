"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Subchapter {
	id: number;
	subchapter_number: string;
	subchapter_name: string;
}

interface Chapter {
	id: number;
	chapter_number: number;
	chapter_name: string;
	subchapters: Subchapter[];
}

interface ChapterSelectionProps {
	chapters: Chapter[];
	selectedChapters: number[];
	selectedSubchapters: number[];
	onChapterToggle: (chapterId: number) => void;
	onSubchapterToggle: (subchapterId: number) => void;
	onSelectAll: () => void;
}

export function ChapterSelection({
	chapters,
	selectedChapters,
	selectedSubchapters,
	onChapterToggle,
	onSubchapterToggle,
	onSelectAll,
}: ChapterSelectionProps) {
	const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

	const toggleChapterExpansion = (chapterId: number) => {
		setExpandedChapters(prev => {
			const newSet = new Set(prev);
			if (newSet.has(chapterId)) {
				newSet.delete(chapterId);
			} else {
				newSet.add(chapterId);
			}
			return newSet;
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<Label className="text-base font-medium">출제 범위 선택</Label>
					<div className="text-sm text-muted-foreground mt-1">
						챕터 선택 시 모든 서브챕터가 자동 선택됩니다
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={onSelectAll}
					className="rounded-full"
				>
					{selectedChapters.length === chapters.length ? "전체 해제" : "전체 선택"}
				</Button>
			</div>
			
			<ScrollArea className="h-[280px] w-full">
				<div className="space-y-2">
					{chapters.map((chapter) => (
						<div key={chapter.id} className="border rounded-lg overflow-hidden bg-card">
							{/* 챕터 헤더 - sticky */}
							<div className="sticky top-0 bg-muted/20 z-10">
								<div className="flex items-center">
									<Toggle
										pressed={selectedChapters.includes(chapter.id)}
										onPressedChange={() => onChapterToggle(chapter.id)}
										className="flex-1 justify-start font-medium text-left h-auto p-3 bg-transparent hover:bg-muted/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary rounded-none"
									>
										<div className="flex items-center gap-3 w-full">
											<div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
												{chapter.chapter_number}
											</div>
											<div className="flex-1 text-left">
												<div className="font-medium text-sm">{chapter.chapter_name}</div>
											</div>
										</div>
									</Toggle>
									{chapter.subchapters && chapter.subchapters.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => toggleChapterExpansion(chapter.id)}
											className="h-12 w-12 p-0 rounded-none border-l bg-muted/20"
										>
											{expandedChapters.has(chapter.id) ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
										</Button>
									)}
								</div>
							</div>

							{/* 서브챕터 요약 및 목록 */}
							{chapter.subchapters && chapter.subchapters.length > 0 && (
								<div>
									{/* 서브챕터 요약 - sticky */}
									<div className="sticky top-12 bg-muted/10 border-t px-3 py-2 text-sm text-muted-foreground z-10">
										<span>
											{chapter.subchapters.filter(sub => selectedSubchapters.includes(sub.id)).length} / {chapter.subchapters.length} 서브챕터 선택됨
										</span>
									</div>
									
									{/* 서브챕터 상세 목록 (접기/펼치기) */}
									{expandedChapters.has(chapter.id) && (
										<div className="p-3 border-t bg-muted/5">
											<div className="grid gap-2" style={{
												gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
											}}>
												{chapter.subchapters.map((subchapter) => (
													<Toggle
														key={subchapter.id}
														pressed={selectedSubchapters.includes(subchapter.id)}
														onPressedChange={() => onSubchapterToggle(subchapter.id)}
														disabled={selectedChapters.includes(chapter.id)}
														className="justify-start text-left h-auto p-3 text-sm bg-background hover:bg-muted/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary disabled:opacity-50 border rounded-md"
													>
														<div className="flex items-start gap-2 w-full">
															<span className="flex-shrink-0 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
																{subchapter.subchapter_number}
															</span>
															<span className="flex-1 leading-tight text-sm">
																{subchapter.subchapter_name}
															</span>
														</div>
													</Toggle>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</ScrollArea>
			
			{/* 선택 요약 */}
			<div className="bg-muted/30 p-3 rounded-lg text-sm">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground">선택된 항목</span>
					<div className="flex gap-4 text-xs">
						<span className="text-primary font-medium">
							챕터: {selectedChapters.length}/{chapters.length}
						</span>
						<span className="text-primary font-medium">
							서브챕터: {selectedSubchapters.length}/
							{chapters.reduce((total, chapter) => total + (chapter.subchapters?.length || 0), 0)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
