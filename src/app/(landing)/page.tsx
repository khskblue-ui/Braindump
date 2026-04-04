import Link from 'next/link';
import { HeroDemo } from '@/components/landing/HeroDemo';
import { InstallButton } from '@/components/landing/InstallButton';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="px-6 pt-20 pb-8 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          적어두고도 못 찾고,
          <br />
          <span className="italic text-gray-400">안 적으면 까먹고.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
          일단 쏟아내세요. 정리는 AI가 합니다.
          <br />
          텍스트, 사진, PDF — 뭐든 던지세요.
        </p>
        <div className="mt-8">
          <InstallButton />
        </div>

        <div className="mt-16">
          <HeroDemo />
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 px-6 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
            메모 앱은 많은데,
            <br />
            왜 항상 찾을 수가 없을까?
          </h2>

          <div className="mt-14 space-y-0">
            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg sm:text-xl font-bold">선택의 피로</h3>
                <span className="text-sm text-gray-300 font-medium">01</span>
              </div>
              <p className="text-gray-500">
                &ldquo;어느 폴더에 넣지?&rdquo; — 고민하다 그냥 안 적음.
              </p>
            </div>
            <hr className="border-gray-200" />

            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg sm:text-xl font-bold">정리의 미루기</h3>
                <span className="text-sm text-gray-300 font-medium">02</span>
              </div>
              <p className="text-gray-500">
                &ldquo;나중에 정리해야지&rdquo; — 그 나중은 오지 않음.
              </p>
            </div>
            <hr className="border-gray-200" />

            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg sm:text-xl font-bold">잃어버린 기억</h3>
                <span className="text-sm text-gray-300 font-medium">03</span>
              </div>
              <p className="text-gray-500">
                &ldquo;제목 없는 메모 47개&rdquo; — 열어봐야 뭔지 앎.
              </p>
            </div>
          </div>

          <p className="mt-8 text-base sm:text-lg text-gray-400 font-medium">
            정리해야 한다는 강박이 기록을 막고 있었습니다.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-14">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">
                # Solution
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                정리하지 마세요.
                <br />
                쏟아내세요.
              </h2>
            </div>
            <p className="text-sm text-gray-400">
              기록의 마찰을 없앤 새로운 방식
            </p>
          </div>

          <div className="space-y-0">
            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg sm:text-xl font-bold">즉각적인 입력</h3>
                <span className="text-sm text-gray-300 font-medium tracking-wider">
                  STEP 1
                </span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                앱을 켜면 입력창이 먼저입니다. 제목, 카테고리, 날짜 — 아무것도
                고를 필요 없습니다. 텍스트를 치든, 사진을 찍든, PDF를 올리든.
                그냥 쏟아내세요.
              </p>
            </div>
            <hr className="border-gray-200" />

            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg sm:text-xl font-bold">AI 자동 분류</h3>
                <span className="text-sm text-gray-300 font-medium tracking-wider">
                  STEP 2
                </span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                할 일, 일정, 아이디어, 메모, 지식. AI가 문맥을 파악하여 5가지
                카테고리로 자동 태깅하고 최적의 형태로 변환합니다.
              </p>
            </div>
            <hr className="border-gray-200" />

            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg sm:text-xl font-bold">캘린더 연동</h3>
                <span className="text-sm text-gray-300 font-medium tracking-wider">
                  STEP 3
                </span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                일정과 할 일은 캘린더와 자동 연동됩니다. 적어두고 잊어버리지
                않도록 적절한 타이밍에 알아서 리마인드 해줍니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Section */}
      <section className="bg-gray-50 px-6 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-14">
            # Use Cases
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 tracking-wider uppercase">
                  Scenario 01
                </span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </div>
              <hr className="border-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-3">회의 중</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                떠오르는 대로 하나씩 던져두세요. &ldquo;디자인 시안
                월요일까지&rdquo;는 할 일로, &ldquo;예산 500만 원
                확정&rdquo;은 메모로, 각각 알아서 정리됩니다.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 tracking-wider uppercase">
                  Scenario 02
                </span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </div>
              <hr className="border-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-3">이동 중</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                갑자기 떠오른 사이드 프로젝트 아이디어 — 한 줄만 적어두면
                아이디어에 안착. 날아가지 않게 즉시 저장됩니다.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 tracking-wider uppercase">
                  Scenario 03
                </span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </div>
              <hr className="border-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-3">취침 전</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                오늘의 잔상과 내일의 할 일로 복잡한 머릿속을 모두 비워내세요.
                가벼운 마음으로 잠들고 정돈된 아침을 맞이하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 sm:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            머릿속을 비우면,
            <br />
            생각이 정리됩니다.
          </h2>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-black text-white px-10 py-4 rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Google로 3초 만에 시작하기
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            무료 · 가입 즉시 사용 · 앱 설치 없이 브라우저에서
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400">
          &copy; 2025 BrainDump. All rights reserved.
        </div>
      </footer>
    </>
  );
}
