'use client';

import { useState } from 'react';
import { InstallGuideModal } from './InstallGuideModal';
import { Download } from 'lucide-react';

export function InstallButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <Download className="h-4 w-4" strokeWidth={2.5} />
        앱 설치하기
      </button>
      <InstallGuideModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
