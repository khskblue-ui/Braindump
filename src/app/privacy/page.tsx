import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보 처리방침 - BrainDump',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">개인정보 처리방침</h1>
      <p className="text-sm text-gray-500 mb-8">시행일: 2026년 4월 10일</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. 개인정보 처리 목적</h2>
          <p>BrainDump(&quot;앱&quot;)는 다음 목적으로 개인정보를 처리합니다:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>회원 가입 및 로그인 인증</li>
            <li>AI 기반 콘텐츠 자동 분류 서비스 제공</li>
            <li>사용자 맞춤형 분류 정확도 개선</li>
            <li>서비스 안정성 유지 및 오류 해결</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>필수 수집</strong>: 이메일 주소 (회원가입 및 로그인)</li>
            <li><strong>서비스 이용 시 생성</strong>: 사용자가 입력한 텍스트, 이미지, PDF 등의 콘텐츠, AI 분류 결과, 사용자 교정 이력, 커스텀 분류 규칙</li>
          </ul>
          <p className="mt-2 text-sm text-gray-500">* Apple 또는 Google 소셜 로그인 시 해당 플랫폼에서 제공하는 이메일 주소만 수집합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. 개인정보의 보유 및 파기</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>회원 탈퇴(계정 삭제) 시 모든 개인정보 및 콘텐츠를 <strong>즉시 영구 삭제</strong>합니다.</li>
            <li>휴지통의 항목은 사용자가 설정한 기간(기본 30일) 후 자동 삭제됩니다.</li>
            <li>로그아웃 시 기기에 저장된 로컬 데이터가 삭제됩니다.</li>
            <li>관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
          <p>BrainDump는 사용자의 개인정보를 제3자에게 판매, 대여하거나 공유하지 않습니다. 단, 다음의 경우 예외로 합니다:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>AI 분류 처리</strong>: 사용자가 입력한 콘텐츠가 Anthropic Claude API를 통해 분류 목적으로만 처리됩니다. Anthropic의 API 이용약관에 따라 전송된 데이터는 모델 학습에 사용되지 않습니다.</li>
            <li><strong>인증 서비스</strong>: Apple 및 Google 로그인을 위해 해당 플랫폼의 인증 서비스를 이용합니다.</li>
            <li><strong>데이터 저장</strong>: Supabase 클라우드 서비스를 통해 데이터를 저장 및 관리합니다.</li>
            <li><strong>법적 요구</strong>: 법령에 의거하여 요청된 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. 개인정보의 안전성 확보 조치</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>모든 데이터는 Supabase 클라우드에 암호화되어 저장됩니다.</li>
            <li>모든 통신은 HTTPS(TLS 1.2 이상)로 암호화됩니다.</li>
            <li>사용자 인증은 Supabase Auth 및 업계 표준 OAuth 2.0을 통해 관리됩니다.</li>
            <li>비밀번호는 인증 서비스 제공자(Supabase Auth)에 의해 단방향 해시 처리됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. 이용자의 권리 및 행사 방법</h2>
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>계정 삭제</strong>: 설정 &gt; 계정 삭제를 통해 모든 데이터를 영구 삭제할 수 있습니다.</li>
            <li><strong>데이터 관리</strong>: 설정에서 AI 분류 교정 이력과 커스텀 규칙을 직접 관리(조회, 삭제)할 수 있습니다.</li>
            <li><strong>열람 및 정정 요청</strong>: 아래 연락처로 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. 개인정보 보호책임자 및 연락처</h2>
          <ul className="list-none space-y-1">
            <li>담당자: 김현성</li>
            <li>이메일: <a href="mailto:lifescienkhs@naver.com" className="text-blue-500 underline">lifescienkhs@naver.com</a></li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            개인정보 침해 관련 상담이 필요한 경우, 한국인터넷진흥원(KISA) 개인정보 침해신고센터(118)에 문의하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. 개인정보 처리방침의 변경</h2>
          <p>이 개인정보 처리방침은 법령, 정책 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.</p>
        </section>
      </div>
    </main>
  )
}
