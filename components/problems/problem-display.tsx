"use client";
import { TextAnimate } from "@/components/imported/magicui/text-animate";

interface ProblemDisplayProps {
	subchapterName: string;
	problemNumber: string;
}

export function ProblemDisplay({
	subchapterName,
	problemNumber,
}: ProblemDisplayProps) {
	return (
		<div className="flex-1 flex justify-center items-center px-4">
			<div className="text-center mb-8 flex items-center justify-center gap-2">
				<TextAnimate animation="blurIn" as="h1" by="line" className="text-4xl text-gray-500">
					{subchapterName}
				</TextAnimate>
				<TextAnimate animation="blurIn" as="h1" by="line" className="text-4xl">
					{problemNumber}
				</TextAnimate>
			</div>
		</div>
	);
}
