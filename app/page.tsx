import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // 로그인된 사용자는 메뉴로 리다이렉트
    redirect('/menu')
  } else {
    // 비로그인 사용자는 로그인 페이지로 리다이렉트
    redirect('/login')
  }
}
