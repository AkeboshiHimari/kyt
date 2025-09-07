"use client";
import { TextAnimate } from "@/components/imported/magicui/text-animate";

interface ProblemDisplayProps {
	subchapterName?: string; // 수학 과목의 경우 없을 수 있음
	problemNumber: string;
	textbookName?: string;
	isPaused: boolean;
}

export function ProblemDisplay({
	subchapterName,
	problemNumber,
	textbookName,
	isPaused,
}: ProblemDisplayProps) {
	return (
		<div className="flex-1 flex justify-center items-center px-4">
			{!isPaused ? (
				<div className="text-center mb-8 flex flex-col items-center justify-center gap-2">
					{textbookName && (
						<TextAnimate animation="blurIn" as="p" by="line" className="text-lg text-muted-foreground">
							{textbookName}
						</TextAnimate>
					)}
					<div className="flex items-center justify-center gap-2">
						{subchapterName && (
							<TextAnimate animation="blurIn" as="h1" by="line" className="text-4xl text-muted-foreground">
								{subchapterName}
							</TextAnimate>
						)}
						<TextAnimate animation="blurIn" as="h1" by="line" className="text-4xl">
							{problemNumber}
						</TextAnimate>
					</div>
				</div>
			) : (
				<div className="text-center">
					<div className="text-lg text-gray-500">일시정지</div>
				</div>
			)}
		</div>
	);
}
