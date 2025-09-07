"use client";

import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";

interface Textbook {
	id: number;
	textbook_name: string;
	textbook_abbreviation: string;
}

interface TextbookSelectionProps {
	textbooks: Textbook[];
	selectedTextbooks: number[];
	onTextbookToggle: (textbookId: number) => void;
}

export function TextbookSelection({
	textbooks,
	selectedTextbooks,
	onTextbookToggle,
}: TextbookSelectionProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Label className="text-base font-medium">교재 선택</Label>
				<div className="text-sm text-muted-foreground">
					문제 출제에 사용할 교재를 선택하세요 (하나만 선택 가능)
				</div>
			</div>
			
			<div className="grid gap-3">
				{textbooks.map((textbook) => (
					<Toggle
						key={textbook.id}
						pressed={selectedTextbooks.includes(textbook.id)}
						onPressedChange={() => onTextbookToggle(textbook.id)}
						className="w-full justify-start h-auto p-4 bg-card border hover:bg-muted/50 data-[state=on]:bg-primary/10 data-[state=on]:border-primary/50 data-[state=on]:text-primary"
					>
						<div className="flex items-center gap-3 w-full text-left">
							<div className="rounded-full flex-shrink-0 w-10 h-10 bg-primary/10 flex items-center justify-center">
								<span className="text-primary font-bold text-sm">
									{textbook.textbook_abbreviation || textbook.textbook_name.charAt(0)}
								</span>
							</div>
							<div className="flex-1">
								<div className="font-medium">{textbook.textbook_name}</div>
							</div>
						</div>
					</Toggle>
				))}
			</div>
			
			{selectedTextbooks.length === 0 && (
				<div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
					최소 하나의 교재를 선택해주세요.
				</div>
			)}
		</div>
	);
}
