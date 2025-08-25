"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  // problems 페이지에서는 푸터 전체 숨김
  const isProblemsPage = pathname?.includes('/problems');

  if (isProblemsPage) {
    return null;
  }

  return (
    <footer className="py-4">
      <div className="flex gap-4">
        <Button variant="link" size="sm">
          <Link href="/terms">
            <span className="text-sm">약관</span>
          </Link>
        </Button>
        <Button variant="link" size="sm">
          <Link href="/privacy">
            <span className="text-sm">개인정보처리방침</span>
          </Link>
        </Button>
      </div>
    </footer>
  );
}
