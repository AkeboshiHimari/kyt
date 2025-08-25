"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  
  // problems 페이지에서는 헤더 전체 숨김
  const isProblemsPage = pathname?.includes('/problems');
  // 로그인 페이지에서는 로그인 버튼만 숨김
  const isLoginPage = pathname === '/login';

  if (isProblemsPage) {
    return null;
  }

  return (
    <header className="flex justify-between items-center py-4">
      <Button variant="link" size="lg">
        <Link href="/">
          <span className="text-2xl">kyt</span>
        </Link>
      </Button>
      {!isLoginPage && (
        <Button variant="link" size="lg">
          <Link href="/login">
            <span>로그인</span>
          </Link>
        </Button>
      )}
    </header>
  );
}
