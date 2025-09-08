'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter()
	const supabase = createClient()

	useEffect(() => {
		// 현재 사용자 상태 확인
		const checkUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			if (user) {
				router.replace('/menu')
				return
			}
		}

		checkUser()

		// Auth 상태 변화 감지
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (event === 'SIGNED_IN' && session?.user) {
					// 로그인 완료시 즉시 리다이렉트
					router.replace('/menu')
				}
			}
		)

		return () => subscription.unsubscribe()
	}, [router, supabase])

	return (
		<div className="flex flex-col gap-4 items-center justify-center h-full">
			<div className="flex flex-col gap-8 text-center items-center justify-vetween">
				<h1 className="text-6xl">kyt</h1>
				<GoogleLoginButton 
					className="h-12 text-base rounded-full"
					redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/menu` : undefined}
				/>
			</div>
			<p className="text-muted-foreground text-xs">
				계속하면{" "}
				<Link href="/terms" className="text-muted-foreground underline">
					약관
				</Link>{" "}
				및{" "}
				<Link href="/privacy" className="text-muted-foreground underline">
					개인정보처리방침
				</Link>
				에 동의하는 것으로 간주됩니다.
			</p>
		</div>
	);
}
