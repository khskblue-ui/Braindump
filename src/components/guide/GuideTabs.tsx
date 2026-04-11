'use client';

import { Smartphone, Monitor } from 'lucide-react';

type Platform = 'ios' | 'web';

interface GuideTabsProps {
  activeTab: Platform;
  onTabChange: (tab: Platform) => void;
}

const TABS: { id: Platform; label: string; icon: typeof Smartphone }[] = [
  { id: 'ios', label: 'iOS 앱', icon: Smartphone },
  { id: 'web', label: '웹 (PWA)', icon: Monitor },
];

export function GuideTabs({ activeTab, onTabChange }: GuideTabsProps) {
  return (
    <div className="sticky top-[57px] z-40 bg-white/95 backdrop-blur py-3">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
