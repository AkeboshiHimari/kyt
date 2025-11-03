"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  
  // 헤더를 전체 숨길 페이지를 리스트로 관리
  const headerHiddenPages = [
    '/physics/problems',
    '/calculus/problems',
    '/linear-algebra/problems',
  ];
  const isHeaderHidden = headerHiddenPages.some((page) =>
    pathname === page || (page !== '/' && pathname?.startsWith(page))
  );
  // 로그인 페이지에서는 로그인 버튼만 숨김
  const isLoginPage = pathname === '/login';

  if (isHeaderHidden) {
    return (
      <header className="flex justify-between items-center py-4 invisible">
        <Button variant="link" size="lg">
          <Link href="/">
            <span className="text-2xl">kyt</span>
          </Link>
        </Button>
        {!isLoginPage && <UserMenu />}
      </header>
    )  }

  return (
    <header className="flex justify-between items-center py-4">
      <Button variant="link" size="lg">
        <Link href="/">
          <span className="text-2xl">kyt</span>
        </Link>
      </Button>
      {!isLoginPage && <UserMenu />}
    </header>
  );
}
