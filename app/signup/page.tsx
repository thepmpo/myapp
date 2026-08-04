"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { isValidPassword } from "@/app/lib/passwordRules";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const allRequiredAgreed = agreeAge && agreeTerms && agreePrivacy;
  const allChecked = allRequiredAgreed && agreeMarketing;
  const canSubmit =
    allRequiredAgreed &&
    email &&
    nickname &&
    isValidPassword(password) &&
    password === confirmPassword &&
    !loading;

  const toggleAll = (checked: boolean) => {
    setAgreeAge(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleSignup = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNicknameError("");
    setError("");

    if (!email || !password || !nickname) {
      setError("이메일, 비밀번호, 닉네임을 모두 입력해주세요");
      return;
    }

    if (!isValidPassword(password)) {
      setPasswordError("다른 비밀번호를 입력해주세요");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("위 비밀번호와 같지 않습니다");
      return;
    }

    if (!allRequiredAgreed) {
      setError("필수 약관에 모두 동의해주세요");
      return;
    }

    setLoading(true);

    const { data: existingNickname } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .maybeSingle();

    if (existingNickname) {
      setLoading(false);
      setNicknameError("이미 사용 중인 닉네임입니다");
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

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setEmailError("이미 가입된 이메일입니다");
      } else if (signUpError.message.includes("Database error")) {
        setNicknameError("이미 사용 중인 닉네임입니다");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
        <h1 className="text-xl font-bold text-ink text-center mb-6">The PMPO</h1>
        <p className="text-sm text-ink-soft text-center mb-4">
          가입이 완료되었습니다. 이메일을 확인해주세요.
        </p>
        <a
          href="/login"
          className="block text-sm text-accent hover:text-accent-hover text-center font-medium"
        >
          로그인하러 가기
        </a>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-8 w-full max-w-[400px]">
      <h1 className="text-xl font-bold text-ink text-center mb-1">The PMPO</h1>
      <p className="text-sm text-ink-soft text-center mb-6">회원가입</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">이메일</label>
          <input
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {emailError && <p className="mt-1.5 text-sm text-red-500">{emailError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">비밀번호</label>
          <input
            type="password"
            placeholder="8자 이상, 영문+숫자 조합"
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              setPasswordError(value && !isValidPassword(value) ? "다른 비밀번호를 입력해주세요" : "");
              setConfirmPasswordError(confirmPassword && value !== confirmPassword ? "위 비밀번호와 같지 않습니다" : "");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {passwordError && <p className="mt-1.5 text-sm text-red-500">{passwordError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호 다시 입력"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);
              setConfirmPasswordError(value && value !== password ? "위 비밀번호와 같지 않습니다" : "");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {confirmPasswordError && <p className="mt-1.5 text-sm text-red-500">{confirmPasswordError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">닉네임</label>
          <input
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError("");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {nicknameError && <p className="mt-1.5 text-sm text-red-500">{nicknameError}</p>}
        </div>

        <div className="rounded-lg border border-border bg-paper p-3.5 flex flex-col gap-2.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-ink pb-2 border-b border-border">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            전체 동의
          </label>

          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={agreeAge}
              onChange={(e) => setAgreeAge(e.target.checked)}
            />
            [필수] 만 14세 이상입니다
          </label>

          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            [필수] 이용약관 동의{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft underline hover:text-accent"
            >
              보기
            </a>
          </label>

          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
            />
            [필수] 개인정보처리방침 동의{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft underline hover:text-accent"
            >
              보기
            </a>
          </label>

          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
            />
            [선택] 마케팅 정보 수신 동의
          </label>
        </div>

        {error && <p className="text-sm text-red-500 m-0">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={!canSubmit}
          className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover disabled:bg-border disabled:text-ink-soft cursor-pointer"
        >
          {loading ? "가입 중..." : "가입하기"}
        </button>

        <a href="/login" className="text-sm text-ink-soft hover:text-accent text-center">
          이미 계정이 있으신가요? 로그인
        </a>
      </div>
    </div>
  );
}
