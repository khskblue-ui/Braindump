'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, Settings, LogOut } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();

  const links = [
    { href: '/', label: '홈', icon: Brain },
    { href: '/knowledge', label: '지식', icon: BookOpen },
    { href: '/settings', label: '설정', icon: Settings },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-3xl flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">🧠</span>
          <span className="hidden sm:inline">BrainDump</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}

          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
