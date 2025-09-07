import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { SUBJECT_NAME_MAPPING } from '@/lib/filter-utils';

interface UserSettingsData {
  selectedTextbooks: number[];
  selectedChapters: number[];
  selectedSubchapters: number[];
  selectedDifficulties: string[];
  totalProblems: number;
}

// GET: 사용자의 과목별 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subject: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 사용자 인증 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { subject } = await params;
    const subjectValue = subject;
    const actualSubjectName = SUBJECT_NAME_MAPPING[subjectValue] || subjectValue;

    // 과목 ID 찾기
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('subject_name', actualSubjectName)
      .single();

    if (subjectError || !subjectData) {
      return NextResponse.json(
        { error: '과목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 설정 조회
    const { data: settings, error: settingsError } = await supabase
      .from('user_subject_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject_id', subjectData.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      // PGRST116은 "결과 없음" 에러 코드
      console.error('설정 조회 오류:', settingsError);
      return NextResponse.json(
        { error: '설정을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 설정이 없으면 기본값 반환
    if (!settings) {
      return NextResponse.json({
        selectedTextbooks: [],
        selectedChapters: [],
        selectedSubchapters: [],
        selectedDifficulties: ['1', '2', '3'],
        totalProblems: 10,
        isDefault: true
      });
    }

    return NextResponse.json({
      selectedTextbooks: settings.selected_textbooks || [],
      selectedChapters: settings.selected_chapters || [],
      selectedSubchapters: settings.selected_subchapters || [],
      selectedDifficulties: settings.selected_difficulties || ['2', '3'],
      totalProblems: settings.problem_count || 10,
      isDefault: false
    });

  } catch (error) {
    console.error('설정 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 사용자의 과목별 설정 저장
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subject: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 사용자 인증 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { subject } = await params;
    const subjectValue = subject;
    const actualSubjectName = SUBJECT_NAME_MAPPING[subjectValue] || subjectValue;

    // 요청 본문에서 설정 데이터 파싱
    const settingsData: UserSettingsData = await request.json();

    // 유효성 검사
    if (!Array.isArray(settingsData.selectedTextbooks) ||
        !Array.isArray(settingsData.selectedChapters) ||
        !Array.isArray(settingsData.selectedSubchapters) ||
        !Array.isArray(settingsData.selectedDifficulties) ||
        typeof settingsData.totalProblems !== 'number') {
      return NextResponse.json(
        { error: '잘못된 설정 데이터입니다.' },
        { status: 400 }
      );
    }

    // 문제 수 범위 검사
    if (settingsData.totalProblems < 1 || settingsData.totalProblems > 20) {
      return NextResponse.json(
        { error: '문제 수는 1~20 사이여야 합니다.' },
        { status: 400 }
      );
    }

    // 과목 ID 찾기
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('subject_name', actualSubjectName)
      .single();

    if (subjectError || !subjectData) {
      return NextResponse.json(
        { error: '과목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 설정 저장 (UPSERT: 있으면 업데이트, 없으면 삽입)
    const { data, error } = await supabase
      .from('user_subject_settings')
      .upsert({
        user_id: user.id,
        subject_id: subjectData.id,
        selected_textbooks: settingsData.selectedTextbooks,
        selected_chapters: settingsData.selectedChapters,
        selected_subchapters: settingsData.selectedSubchapters,
        selected_difficulties: settingsData.selectedDifficulties,
        problem_count: settingsData.totalProblems,
      }, {
        onConflict: 'user_id,subject_id'
      })
      .select()
      .single();

    if (error) {
      console.error('설정 저장 오류:', error);
      return NextResponse.json(
        { error: '설정 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '설정이 성공적으로 저장되었습니다.',
      settings: {
        selectedTextbooks: data.selected_textbooks,
        selectedChapters: data.selected_chapters,
        selectedSubchapters: data.selected_subchapters,
        selectedDifficulties: data.selected_difficulties,
        totalProblems: data.problem_count,
      }
    });

  } catch (error) {
    console.error('설정 저장 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
