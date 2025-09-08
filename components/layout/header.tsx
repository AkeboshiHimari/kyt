"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  
  // 헤더를 전체 숨길 페이지를 리스트로 관리
  const headerHiddenPages = [
    '/', // 홈 페이지
    '/problems' // 문제 페이지 및 하위 페이지
  ];
  const isHeaderHidden = headerHiddenPages.some((page) =>
    pathname === page || (page !== '/' && pathname?.startsWith(page))
  );
  // 로그인 페이지에서는 로그인 버튼만 숨김
  const isLoginPage = pathname === '/login';

  if (isHeaderHidden) {
    return null;
  }

  return (
    <header className="flex justify-between items-center py-4">
      <Button variant="link" size="lg">
        <Link href="/menu">
          <span className="text-2xl">kyt</span>
        </Link>
      </Button>
      {!isLoginPage && <UserMenu />}
    </header>
  );
}
