// 헤더 우측 프로필 아이콘을 누르면 뜨는 공용 드롭다운(마이페이지/관리자 페이지/로그아웃)입니다.
"use client";

import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type ProfileMenuProps = {
  userId: string;
  isAdmin: boolean;
  className?: string;
  menuClassName?: string;
  children: React.ReactNode;
};

export default function ProfileMenu({ userId, isAdmin, className = "", menuClassName = "", children }: ProfileMenuProps) {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <details className={`relative ${className}`}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{children}</summary>
      <div className={`absolute right-0 top-full z-20 mt-2 w-40 border border-[#f1efed] bg-surface py-1 shadow-sm ${menuClassName}`}>
        <Link href={"/profile/" + userId} className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-black/[0.03]">
          마이페이지
        </Link>
        {isAdmin && (
          <Link href="/admin" className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-black/[0.03]">
            관리자 페이지
          </Link>
        )}
        <button type="button" onClick={logout} className="block w-full px-3 py-2 text-left text-sm text-error hover:bg-black/[0.03]">
          로그아웃
        </button>
      </div>
    </details>
  );
}
