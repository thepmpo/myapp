import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="max-w-[680px] mx-auto px-5 sm:px-8 pt-8 pb-24 lg:pb-8">
      <div className="mb-5">
        <Link href="/signup" className="text-sm text-ink-soft hover:text-accent">
          ← 회원가입으로
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-ink mb-6">이용약관</h1>

      <div className="bg-paper text-ink-soft border border-border rounded-lg px-4 py-3 text-sm mb-6">
        본 약관은 초안이며, 정식 게시 전 변호사 등 법률 전문가의 검토가 필요합니다.
      </div>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제1조 (목적)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          이 약관은 The PMPO(이하 "회사")가 제공하는 PM/PO 커뮤니티 서비스(이하 "서비스")의
          이용조건 및 절차, 회원과 회사의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을
          목적으로 합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제2조 (용어의 정의)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          1. "서비스"란 회사가 제공하는 Insights, Circle 게시판 등 일체의 서비스를 말합니다.<br />
          2. "회원"이란 이 약관에 동의하고 이메일과 비밀번호로 회원가입을 완료하여 서비스를
          이용하는 자를 말합니다.<br />
          3. "게시물"이란 회원이 서비스 이용과 관련하여 게시한 문자, 이미지 등의 정보를 말합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제3조 (약관의 효력 및 변경)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          1. 이 약관은 서비스 화면에 게시하여 공지함으로써 효력이 발생합니다.<br />
          2. 회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자
          및 변경사유를 명시하여 최소 7일 전(회원에게 불리한 변경은 30일 전)부터 공지합니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제4조 (회원가입)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          1. 회원가입은 이용자가 약관 내용에 동의하고 이메일, 비밀번호, 닉네임 등 필요한 정보를
          입력하여 신청하면, 회사가 이를 승낙함으로써 체결됩니다.<br />
          2. 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 유보하거나 거부할 수 있습니다.
          <br />
          &nbsp;&nbsp;- 타인의 정보를 도용한 경우<br />
          &nbsp;&nbsp;- 이미 가입된 이메일 또는 닉네임으로 재가입하는 경우<br />
          &nbsp;&nbsp;- 만 14세 미만인 경우
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제5조 (회원의 의무)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          회원은 다음 각 호의 행위를 하여서는 안 됩니다.<br />
          &nbsp;&nbsp;- 타인의 정보 도용<br />
          &nbsp;&nbsp;- 회사 및 제3자의 저작권 등 지적재산권 침해<br />
          &nbsp;&nbsp;- 회사 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위<br />
          &nbsp;&nbsp;- 외설, 폭력적 내용, 기타 공서양속에 반하는 정보의 게시<br />
          &nbsp;&nbsp;- 서비스의 정상적인 운영을 방해하는 행위(도배, 스팸, 금지 키워드 우회 등)
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제6조 (게시물의 관리)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          1. 게시물에 대한 저작권 및 관리 책임은 게시자 본인에게 있습니다.<br />
          2. 회원의 게시물이 관련 법령 및 이 약관에 위반되거나 타인의 권리를 침해하는 경우,
          또는 다른 회원으로부터 신고가 접수되어 검토 결과 조치가 필요하다고 판단되는 경우,
          회사는 사전 통지 없이 해당 게시물을 삭제하거나 이동할 수 있습니다.<br />
          3. 회사는 이용자 보호를 위해 신고된 게시물·댓글을 검토하고, 위반이 확인된 회원에
          대해 게시물 삭제, 작성 제한(차단) 등의 조치를 취할 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제7조 (계정 및 탈퇴)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          1. 회원은 언제든지 마이페이지 내 탈퇴 기능을 통해 이용계약을 해지할 수 있습니다.<br />
          2. 회원 탈퇴 시 닉네임은 유지되며, 프로필 사진은 기본 이미지로 초기화되고, 회원이
          작성한 게시물 및 댓글은 삭제되지 않고 유지됩니다. 계정 식별에 사용된 개인정보는
          개인정보처리방침에 따라 처리됩니다.<br />
          3. 회사는 회원이 제5조를 위반하거나 서비스 운영을 방해한 경우, 사전 통지 후 이용을
          제한하거나 이용계약을 해지할 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제8조 (면책조항)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          1. 회사는 천재지변, 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임을 지지
          않습니다.<br />
          2. 회사는 회원이 게시한 정보, 자료, 사실의 신뢰도 및 정확성에 대해 책임을 지지
          않습니다.<br />
          3. 회사는 회원 간 또는 회원과 제3자 사이에 서비스를 매개로 발생한 분쟁에 개입할
          의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">제9조 (분쟁해결 및 준거법)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          이 약관은 대한민국 법령에 따라 규율되고 해석되며, 서비스 이용과 관련하여 분쟁이
          발생한 경우 민사소송법상의 관할법원에 소를 제기할 수 있습니다.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold text-ink mt-6 mb-2">부칙</h2>
        <p className="text-sm text-ink-soft leading-relaxed">이 약관은 2026년 8월 2일부터 시행합니다.</p>
      </section>
    </div>
  );
}
