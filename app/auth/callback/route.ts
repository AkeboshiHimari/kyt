import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
			// 모든 관련 경로의 캐시 무효화 - layout부터 시작해서 모든 것을 새로고침
			revalidatePath('/', 'layout');
			revalidatePath('/');
			revalidatePath('/login');
			revalidatePath('/menu');
			
			// 브라우저 히스토리 캐시도 무효화
			const response = NextResponse.redirect(new URL(next, origin), { 
				status: 302 // 302 Found - 표준 리다이렉트
			});
			
			// 강력한 캐시 무효화 헤더
			response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
			response.headers.set('Pragma', 'no-cache');
			response.headers.set('Expires', '0');
			response.headers.set('Surrogate-Control', 'no-store');
			
			return response;
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
