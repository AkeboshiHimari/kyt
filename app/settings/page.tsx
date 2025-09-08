import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()

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
