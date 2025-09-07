import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 사용자 인증 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/')
  }

  // 프로필 정보 가져오기
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error loading profile:', profileError)
  }

  return <SettingsClient user={user} profile={profile} />
}
