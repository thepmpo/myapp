"use client";

import Link from "next/link";
import { LockIcon } from "@/app/components/icons";

export default function LoginPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[340px] bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(23,27,35,0.045)] p-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-border">
          <LockIcon className="text-accent" />
        </div>

        <h2 className="text-center text-[16px] font-bold text-ink mb-2">로그인하고 확인해보세요</h2>

        <p className="text-center text-sm text-ink-soft leading-relaxed mb-6">
          이 글은 로그인한 분들만 볼 수 있어요.
          <br />
          가입은 금방 끝나요.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium text-center hover:bg-accent-hover"
          >
            로그인하기
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-transparent text-ink-soft text-sm cursor-pointer hover:text-ink"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
