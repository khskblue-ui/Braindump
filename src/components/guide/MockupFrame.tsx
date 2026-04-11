'use client';

type Platform = 'ios' | 'web';

interface MockupFrameProps {
  platform: Platform;
  children: React.ReactNode;
}

function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[300px] sm:max-w-[320px]">
      <div className="relative rounded-[2.5rem] border-[3px] border-gray-900 bg-white overflow-hidden shadow-xl">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-gray-900 rounded-full z-10" />
        {/* Screen content */}
        <div className="pt-14 pb-6 px-1 min-h-[480px] sm:min-h-[540px]">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-gray-900 rounded-full" />
      </div>
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[480px] sm:max-w-[560px]">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2">
            <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 text-center">
              braindump-jet.vercel.app
            </div>
          </div>
        </div>
        {/* Browser content */}
        <div className="min-h-[360px] sm:min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MockupFrame({ platform, children }: MockupFrameProps) {
  if (platform === 'ios') {
    return <IPhoneFrame>{children}</IPhoneFrame>;
  }
  return <BrowserFrame>{children}</BrowserFrame>;
}
