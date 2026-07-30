import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/signup">← 회원가입으로</Link>
      </div>

      <h1 style={{ marginBottom: 16 }}>개인정보처리방침</h1>

      <p style={{ color: "#999", fontSize: 13, marginBottom: 24 }}>
        본 방침은 초안 자리이며, 실제 조항은 법률 검토 후 확정되어 게재될 예정입니다.
      </p>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>1. 수집하는 개인정보 항목</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>2. 개인정보의 수집 및 이용 목적</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>3. 개인정보의 보유 및 이용 기간</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>4. 개인정보의 파기</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>
    </div>
  );
}
