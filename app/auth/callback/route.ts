import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // A redirect destination can be included as a ?next= parameter
  // If next is not present, default to /menu
  const next = searchParams.get('next') ?? '/menu'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    cookieStore.getAll()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // URL to redirect to after sign in process completes
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // URL to redirect to if the sign in process fails
  return NextResponse.redirect('/auth/auth-code-error')
}
