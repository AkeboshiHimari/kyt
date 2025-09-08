import { GoogleLoginButton } from "@/components/auth/google-login-button";
import Link from "next/link";

export default function LoginPage() {
	// Middleware에서 인증 상태를 확인하고 리다이렉트를 처리합니다
	return (
		<div className="flex flex-col gap-4 items-center justify-center h-full">
			<div className="flex flex-col gap-8 text-center items-center justify-vetween">
				<h1 className="text-6xl">kyt</h1>
				<GoogleLoginButton 
					className="h-12 text-base rounded-full"
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
