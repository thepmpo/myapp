import Link from "next/link";

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/signup">← 회원가입으로</Link>
      </div>

      <h1 style={{ marginBottom: 16 }}>이용약관</h1>

      <p style={{ color: "#999", fontSize: 13, marginBottom: 24 }}>
        본 약관은 초안 자리이며, 실제 조항은 법률 검토 후 확정되어 게재될 예정입니다.
      </p>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>제1조 (목적)</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>제2조 (이용자의 의무)</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>제3조 (게시물의 관리)</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>제4조 (계정 및 탈퇴)</h2>
        <p style={{ color: "#666" }}>준비 중입니다.</p>
      </section>
    </div>
  );
}
