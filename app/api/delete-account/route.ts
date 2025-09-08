import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    // admin 클라이언트로 사용자 계정 삭제
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      return NextResponse.json(
        { error: '계정 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error during account deletion:', error)
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
