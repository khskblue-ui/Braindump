import Link from 'next/link';
import { HeroDemo } from '@/components/landing/HeroDemo';
import { FeatureHighlight } from '@/components/landing/FeatureHighlight';
import { PlatformCTA, PlatformCards } from '@/components/landing/PlatformCTA';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { AppPreview } from '@/components/landing/AppPreview';
import { FAQ } from '@/components/landing/FAQ';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="px-6 pt-20 pb-8 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight animate-fade-in-up">
          적어두고도 못 찾고,
          <br />
          <span className="italic text-gray-400">안 적으면 까먹고.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-md mx-auto leading-relaxed animate-fade-in-up-delay-1">
          일단 쏟아내세요. 정리는 AI가 합니다.
          <br />
          텍스트, 음성, 사진, PDF — 뭐든 던지세요.
        </p>
        <div className="mt-8 animate-fade-in-up-delay-2">
          <PlatformCTA />
        </div>

        <div className="mt-16 animate-fade-in-up-delay-3">
          <HeroDemo />
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 px-6 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
              메모 앱은 많은데,
              <br />
              왜 항상 찾을 수가 없을까?
            </h2>
          </ScrollReveal>

          <div className="mt-14 space-y-0">
            <ScrollReveal delay={100}>
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
            </ScrollReveal>

            <ScrollReveal delay={200}>
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
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="py-8">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold">잃어버린 기억</h3>
                  <span className="text-sm text-gray-300 font-medium">03</span>
                </div>
                <p className="text-gray-500">
                  &ldquo;제목 없는 메모 47개&rdquo; — 열어봐야 뭔지 앎.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            <p className="mt-8 text-base sm:text-lg text-gray-400 font-medium">
              정리해야 한다는 강박이 기록을 막고 있었습니다.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
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
          </ScrollReveal>

          <div className="space-y-0">
            <ScrollReveal delay={100}>
              <div className="py-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg sm:text-xl font-bold">다양한 입력</h3>
                  <span className="text-sm text-gray-300 font-medium tracking-wider">
                    STEP 1
                  </span>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  텍스트, 음성, 사진, PDF — 방법을 고르지 마세요. 말하든 쓰든
                  찍든, 앱을 켜면 입력창이 먼저입니다. 다른 앱에서 공유 한 번이면
                  바로 저장됩니다.
                </p>
              </div>
              <hr className="border-gray-200" />
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="py-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg sm:text-xl font-bold">AI가 알아서 분류</h3>
                  <span className="text-sm text-gray-300 font-medium tracking-wider">
                    STEP 2
                  </span>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  폴더를 고민할 필요 없습니다. AI가 문맥을 읽고 할 일, 일정, 메모,
                  아이디어, 지식으로 자동 분류합니다. 하나의 기록이 여러 카테고리에
                  동시에 속할 수도 있습니다. 당신은 그냥 쏟아내기만 하세요.
                </p>
              </div>
              <hr className="border-gray-200" />
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="py-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg sm:text-xl font-bold">스마트 대시보드</h3>
                  <span className="text-sm text-gray-300 font-medium tracking-wider">
                    STEP 3
                  </span>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  오늘 할 일, 마감 임박 일정, 중요 항목이 한눈에 정리됩니다.
                  핀 고정으로 놓치면 안 될 것들을 항상 위에 두세요.
                  리마인더가 적절한 타이밍에 알려줍니다.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="bg-gray-50 px-6 py-20 sm:py-24">
        <FeatureHighlight />
      </section>

      {/* App Preview Section */}
      <AppPreview />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="bg-gray-50 px-6 py-24 sm:py-32 text-center">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              머릿속을 비우면,
              <br />
              생각이 정리됩니다.
            </h2>
            <p className="mt-6 text-gray-500 max-w-md mx-auto">
              지금 바로 시작하세요. iOS 앱 또는 데스크탑 웹에서.
            </p>
            <div className="mt-10">
              <PlatformCards />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; 2026 BrainDump. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              개인정보 처리방침
            </Link>
            <a href="mailto:lifescienkhs@naver.com" className="hover:text-gray-600 transition-colors">
              문의
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
