import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get("next") ?? "/menu";

	if (code) {
		const cookieStore = cookies();
		const supabase = createClient(cookieStore);
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Force a hard redirect to ensure middleware runs
			const redirectUrl = new URL(next, origin);
			return NextResponse.redirect(redirectUrl, { status: 302 });
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
