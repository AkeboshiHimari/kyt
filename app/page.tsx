import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-start justify-center h-full">
      <Button variant="link" size="lg">
        <Link href="/freestyle">
          <span className="text-6xl font">Freestyle</span>
        </Link>
      </Button>
      <Button variant="link" size="lg" disabled>
        <Link href="/arena">
          <span className="text-6xl">Arena</span>
        </Link>
      </Button>
    </div>
  )
}