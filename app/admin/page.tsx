import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // Get user profile to verify they're admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/menu')
  }

  // Get all pending users
  const { data: pendingUsers, error } = await supabase
    .from('profiles')
    .select(`
      id,
      nickname,
      role,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    redirect('/menu')
  }

  return (
    <AdminClient 
      pendingUsers={pendingUsers || []} 
      currentUser={profile}
    />
  )
}
