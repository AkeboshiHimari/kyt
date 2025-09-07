'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile, UserRole } from '@/lib/db-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserIcon, ShieldIcon, ClockIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminClientProps {
  pendingUsers: Profile[]
  currentUser: Profile
}

export function AdminClient({ pendingUsers, currentUser }: AdminClientProps) {
  const [users, setUsers] = useState(pendingUsers)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdating(userId)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        alert('역할 업데이트 중 오류가 발생했습니다.')
        return
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, updated_at: new Date().toISOString() }
          : user
      ))

      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('역할 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(null)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldIcon className="h-4 w-4" />
      case 'user':
        return <UserIcon className="h-4 w-4" />
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'user':
        return 'default'
      case 'pending':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '관리자'
      case 'user':
        return '사용자'
      case 'pending':
        return '승인 대기'
      default:
        return role
    }
  }

  const pendingCount = users.filter(user => user.role === 'pending').length
  const userCount = users.filter(user => user.role === 'user').length
  const adminCount = users.filter(user => user.role === 'admin').length

  return (
    <div className="flex flex-col h-full px-6 xl:px-8 py-4">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">관리자 대시보드</h1>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              승인이 필요한 사용자
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              서비스를 이용 중인 사용자
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관리자</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">
              관리 권한을 가진 사용자
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 목록 */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>전체 사용자 목록</CardTitle>
          <CardDescription>
            사용자의 역할을 변경하고 계정을 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>닉네임</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>최근 업데이트</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nickname || '미설정'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? formatDate(user.created_at) : '-'}
                    </TableCell>
                    <TableCell>
                      {user.updated_at ? formatDate(user.updated_at) : '-'}
                    </TableCell>
                    <TableCell>
                      {user.id !== currentUser.id && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(newRole: UserRole) => updateUserRole(user.id, newRole)}
                            disabled={updating === user.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">승인 대기</SelectItem>
                              <SelectItem value="user">사용자</SelectItem>
                              <SelectItem value="admin">관리자</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {user.role === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateUserRole(user.id, 'user')}
                              disabled={updating === user.id}
                              className="flex items-center gap-1"
                            >
                              <CheckIcon className="h-4 w-4" />
                              승인
                            </Button>
                          )}
                        </div>
                      )}
                      {user.id === currentUser.id && (
                        <Badge variant="outline">본인</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
