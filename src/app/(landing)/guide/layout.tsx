import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사용 가이드 | BrainDump',
  description: 'BrainDump iOS 앱과 웹 버전의 주요 기능을 한눈에 알아보세요. 빠른 입력, AI 자동 분류, 카테고리 필터, 위젯까지.',
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
