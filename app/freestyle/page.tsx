import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { PlayIcon, SettingsIcon } from "lucide-react";
import { SubjectCard } from "@/app/freestyle/subject-card";

export default function Home() {
	return (
		<div className="flex flex-col h-full px-6 xl:px-8 py-4">
			<h1 className="text-2xl font-semibold">Freestyle</h1>
			<div className="flex-1 flex items-center">
				<Accordion type="single" collapsible>
					<AccordionItem value="physics">
						<AccordionTrigger className="text-5xl">물리학</AccordionTrigger>
						<AccordionContent>
							<SubjectCard title="물리학" value="physics" />
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="calculus">
						<AccordionTrigger className="text-5xl">미분적분학</AccordionTrigger>
						<AccordionContent>
							<SubjectCard title="미분적분학" value="calculus" />
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="linear-algebra">
						<AccordionTrigger className="text-5xl">선형대수학</AccordionTrigger>
						<AccordionContent>
							<SubjectCard title="선형대수학" value="linear-algebra" />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
