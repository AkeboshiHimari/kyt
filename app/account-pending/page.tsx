import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { CheckCircleIcon, ClockIcon } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default async function AccountPendingPage() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/");
	}

	// Get user profile to verify they're actually pending
	const { data: profile } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.single();

	if (!profile) {
		redirect("/");
	}

	// If user is not pending, redirect them to appropriate page
	if (profile.role === "user" || profile.role === "admin") {
		redirect("/menu");
	}

	return (
		<div className="flex flex-col gap-4 h-full px-6 xl:px-8 py-4 items-center justify-center">
			<h1 className="text-4xl">계정 승인 대기 중</h1>
			<div className="flex flex-col">
				<p className="text-muted-foreground text-center items-center">
					사용자의 계정을 검토하고 있습니다.
				</p>
				<p className="text-muted-foreground text-center items-center">
					잠시 후 다시 이용해 주세요.
				</p>
			</div>
      <pre className="text-muted-foreground text-center items-center text-xs">uid: {user.id.slice(-6)}</pre>
		</div>
	);
}
