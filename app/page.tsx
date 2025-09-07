import { GoogleLoginButton } from "@/components/auth/google-login-button";

export default function Home() {
	return (
		<div className="flex flex-col gap-8 items-center justify-center h-full">
			<h1 className="text-6xl">kyt</h1>
			<GoogleLoginButton className="h-12 text-base rounded-full" />
		</div>
	);
}
