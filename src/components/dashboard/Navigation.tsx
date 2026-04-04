'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Trash2, Settings } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function TopHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-3xl flex items-center h-12">
        <Link href="/home" className="flex items-center gap-2 font-bold text-lg">
          <Logo />
          <span>BrainDump</span>
        </Link>
      </div>
    </header>
  );
}

const tabs = [
  { href: '/home', label: '홈', icon: Home },
  { href: '/knowledge', label: '지식', icon: BookOpen },
  { href: '/trash', label: '휴지통', icon: Trash2 },
  { href: '/settings', label: '설정', icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-3xl mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/home' ? pathname === '/home' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors duration-150 ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
