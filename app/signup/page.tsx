"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const allRequiredAgreed = agreeAge && agreeTerms && agreePrivacy;
  const allChecked = allRequiredAgreed && agreeMarketing;
  const canSubmit = allRequiredAgreed && email && password && nickname && !loading;

  const toggleAll = (checked: boolean) => {
    setAgreeAge(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const showTermsPlaceholder = () => {
    alert("약관 페이지는 준비 중입니다");
  };

  const handleSignup = async () => {
    if (!email || !password || !nickname) {
      setError("이메일, 비밀번호, 닉네임을 모두 입력해주세요");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    if (!allRequiredAgreed) {
      setError("필수 약관에 모두 동의해주세요");
      return;
    }

    setError("");
    setLoading(true);

    const { data: existingNickname } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .maybeSingle();

    if (existingNickname) {
      setLoading(false);
      setError("이미 사용 중인 닉네임입니다");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          age_over_14: agreeAge,
          terms_of_service: agreeTerms,
          privacy_policy: agreePrivacy,
          marketing: agreeMarketing,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(
        signUpError.message.includes("already registered")
          ? "이미 가입된 이메일입니다"
          : signUpError.message.includes("Database error")
          ? "이미 사용 중인 닉네임입니다"
          : signUpError.message
      );
      return;
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ padding: 40 }}>
        <h1>회원가입</h1>
        <p>가입이 완료되었습니다. 이메일을 확인해주세요.</p>
        <a href="/login">로그인하러 가기</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>회원가입</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        <input
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호 입력 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          placeholder="닉네임 입력"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          전체 동의
        </label>

        <label>
          <input
            type="checkbox"
            checked={agreeAge}
            onChange={(e) => setAgreeAge(e.target.checked)}
          />
          [필수] 만 14세 이상입니다
        </label>

        <label>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          [필수] 이용약관 동의{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); showTermsPlaceholder(); }}>
            보기
          </a>
        </label>

        <label>
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
          />
          [필수] 개인정보처리방침 동의{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); showTermsPlaceholder(); }}>
            보기
          </a>
        </label>

        <label>
          <input
            type="checkbox"
            checked={agreeMarketing}
            onChange={(e) => setAgreeMarketing(e.target.checked)}
          />
          [선택] 마케팅 정보 수신 동의
        </label>

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <button onClick={handleSignup} disabled={!canSubmit}>
          {loading ? "가입 중..." : "가입하기"}
        </button>

        <a href="/login">이미 계정이 있으신가요? 로그인</a>
      </div>
    </div>
  );
}
