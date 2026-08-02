import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[680px]">
      <div className="mb-5">
        <Link href="/signup" className="text-sm text-ink-soft hover:text-accent">
          ← 회원가입으로
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-ink mb-6">개인정보처리방침</h1>

      <div className="bg-paper text-ink-soft border border-border rounded-lg px-4 py-3 text-sm mb-6">
        본 방침은 초안이며, 정식 게시 전 변호사 등 법률 전문가의 검토가 필요합니다.
      </div>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">1. 수집하는 개인정보 항목</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회사는 회원가입 및 서비스 제공을 위해 다음의 개인정보를 수집합니다.<br />
          - 필수 항목: 이메일 주소, 비밀번호(암호화 저장), 닉네임<br />
          - 선택 항목: 프로필 이미지, 마케팅 정보 수신 동의 여부<br />
          - 서비스 이용 과정에서 자동 생성·수집되는 정보: 작성한 게시물·댓글·좋아요·팔로우
          기록, 접속 IP, 서비스 이용기록, 비로그인 이용자의 조회수 중복 집계 방지를 위한
          쿠키(브라우저 단위, 24시간 후 만료)
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">2. 개인정보의 수집 및 이용 목적</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          - 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 부정 이용 방지<br />
          - 게시물·댓글 작성, 좋아요, 팔로우, 신고 접수 및 처리 등 서비스 제공<br />
          - 신고된 콘텐츠 검토, 이용 제한(차단) 등 이용자 보호 및 건전한 커뮤니티 운영<br />
          - (선택 동의 시) 신규 서비스·이벤트 등 마케팅 정보 안내
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">3. 개인정보의 보유 및 이용 기간</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          원칙적으로 회원 탈퇴 시 지체없이 파기합니다. 다만 관계 법령의 규정에 따라 보존할
          필요가 있는 경우 회사는 관계 법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.<br />
          - 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)<br />
          - 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)<br />
          - 서비스 이용 관련 로그 기록: 3개월 (통신비밀보호법)<br />
          단, 탈퇴 후에도 정책에 따라 게시물·댓글 자체는 닉네임 유지 상태로 존속될 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">4. 개인정보의 제3자 제공</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자가 사전에
          동의한 경우 또는 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에
          따라 수사기관의 요구가 있는 경우는 예외로 합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">5. 개인정보 처리의 위탁</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회사는 서비스 운영을 위해 다음과 같이 개인정보 처리를 위탁하고 있으며, 관계 법령에
          따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정합니다.<br />
          - 수탁업체: Supabase, Inc. / 위탁업무: 회원 인증, 데이터베이스 및 이미지 파일 저장·운영
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">6. 이용자의 권리와 행사 방법</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          이용자는 언제든지 자신의 개인정보를 열람·정정할 수 있으며, 회원 탈퇴를 통해 수집·이용
          동의를 철회할 수 있습니다. 열람·정정은 마이페이지에서, 그 외 권리 행사는 아래
          개인정보보호책임자를 통해 요청할 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">7. 개인정보의 파기</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회사는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
          지체없이 해당 개인정보를 파기합니다. 전자적 파일 형태로 저장된 개인정보는 기록을
          재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">8. 쿠키의 사용</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회사는 비로그인 이용자의 정보게시판 조회수를 중복 집계하지 않기 위해 브라우저 단위의
          쿠키를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이
          경우 조회수 중복 방지 등 일부 기능이 정상 동작하지 않을 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">9. 개인정보보호책임자</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의
          불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.<br />
          - 성명: 김상현<br />
          - 이메일: thepmpo.official@gmail.com
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">10. 고지의 의무</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          현 개인정보처리방침 내용 추가, 삭제 및 수정이 있을 경우 개정 최소 7일 전부터 서비스
          내 공지사항을 통해 고지할 것입니다.<br />
          - 공고일자: 2026년 8월 2일<br />
          - 시행일자: 2026년 8월 2일
        </p>
      </section>
    </div>
  );
}
