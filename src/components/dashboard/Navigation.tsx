'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Trash2, Settings, Globe, Building2, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useEntryStore } from '@/stores/entry-store';
import type { EntryContext } from '@/types';

const CONTEXT_OPTIONS = [
  { label: '전체', value: undefined, icon: Globe, color: undefined },
  { label: '업무', value: 'work' as EntryContext, icon: Building2, color: '#7C3AED' },
  { label: '개인', value: 'personal' as EntryContext, icon: User, color: '#3B82F6' },
] as const;

export function TopHeader() {
  const filter = useEntryStore((s) => s.filter);
  const setFilter = useEntryStore((s) => s.setFilter);
  const currentCtx = filter.context;

  const cycleContext = () => {
    const currentIdx = CONTEXT_OPTIONS.findIndex((o) => o.value === currentCtx);
    const next = CONTEXT_OPTIONS[(currentIdx + 1) % CONTEXT_OPTIONS.length];
    setFilter({ ...filter, context: next.value });
  };

  const current = CONTEXT_OPTIONS.find((o) => o.value === currentCtx) || CONTEXT_OPTIONS[0];
  const Icon = current.icon;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-3xl flex items-center justify-between h-12">
        <Link href="/home" className="flex items-center gap-2 font-bold text-lg">
          <Logo />
          <span>BrainDump</span>
        </Link>
        <button
          onClick={cycleContext}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all border"
          style={current.color ? {
            backgroundColor: `${current.color}12`,
            borderColor: `${current.color}40`,
            color: current.color,
          } : {
            backgroundColor: 'var(--muted)',
            borderColor: 'var(--border)',
            color: 'var(--muted-foreground)',
          }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {current.label}
        </button>
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
