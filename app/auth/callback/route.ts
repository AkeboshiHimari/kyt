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
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		
		if (!error && data.session) {
			// 세션이 성공적으로 생성되었을 때만 리다이렉트
			// Cache-Control 헤더를 추가하여 브라우저 캐싱 방지
			const response = NextResponse.redirect(new URL(next, origin), { 
				status: 302,
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'
				}
			});
			
			return response;
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
