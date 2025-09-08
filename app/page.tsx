import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex flex-col gap-4 justify-center h-full">
			<div className="flex flex-col gap-8 text-center items-start">
				<Button asChild size="lg" variant="link" className="text-5xl">
					<Link href="/menu">
						문제풀이
					</Link>
				</Button>
				<Button disabled size="lg" variant="link" className="text-5xl">
					<Link href="/library">
						자료실
					</Link>
				</Button>
			</div>
		</div>
	);
}
