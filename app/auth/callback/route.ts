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
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		
		if (!error && data.session) {
			// 세션 생성 후 사용자 정보 재확인
			const { data: { user } } = await supabase.auth.getUser();
			
			if (user) {
				// 캐시 무효화 - 모든 관련 경로
				revalidatePath('/', 'layout');
				revalidatePath('/menu');
				revalidatePath('/login');
				
				// 브라우저 캐싱 방지와 함께 강제 리다이렉트
				const response = NextResponse.redirect(new URL(next, origin), { 
					status: 307, // 307 Temporary Redirect - 더 강력한 리다이렉트
					headers: {
						'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
						'Pragma': 'no-cache',
						'Expires': '0',
						'Surrogate-Control': 'no-store',
						'Set-Cookie': `auth-callback=${Date.now()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1`
					}
				});
				
				return response;
			}
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
