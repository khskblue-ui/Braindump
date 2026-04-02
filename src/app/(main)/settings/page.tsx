'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" /> 설정
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">이메일</label>
            <p className="text-sm font-medium">{user?.email || '-'}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
