import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ProfileClient } from './profile-client'
import { getProfileData, type SubjectBreakdown } from '@/lib/profile-data'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/callback')
  }

  try {
    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // getProfileData 함수를 사용하여 모든 프로필 데이터 가져오기
    const profileData = await getProfileData(supabase, user.id)

    return (
      <ProfileClient
        user={user}
        profile={profile}
        totalRating={profileData.totalRating}
        solvingScore={profileData.solvingScore}
        problemCountBonus={profileData.problemCountBonus}
        masteryBonus={profileData.masteryBonus}
        solvedProblemCount={profileData.solvedProblemCount}
        masteryData={profileData.masteryData}
        activityData={profileData.activityData}
        wrongProblems={profileData.wrongProblems}
        topSolvedProblems={profileData.topSolvedProblems}
        subjectBreakdowns={profileData.subjectBreakdowns}
        allSubjectTopProblems={profileData.allSubjectTopProblems}
      />
    )
    
  } catch (error) {
    console.error('프로필 페이지 오류:', error)
    redirect('/')
  }
}
