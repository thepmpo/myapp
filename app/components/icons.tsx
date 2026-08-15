export function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function InsightsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function NoticeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16v11H4Z" />
      <path d="M7 9.5h10M7 13.5h6" />
    </svg>
  );
}

export function ProductIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l3 3v15H6Z" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

export function TrendsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20v-6h3v6M11 20V9h3v11M17 20V4h3v16" />
      <path d="M3 20h19" />
    </svg>
  );
}

export function AiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5ZM18.5 15l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7Z" />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function LikeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7.2-4.4-9.6-8.6C.8 8.2 2 4.7 5.6 4.7c2.1 0 3.6 1.2 4.7 2.9C11.4 5.9 12.9 4.7 15 4.7c3.6 0 4.8 3.5 3.2 6.7C15.8 15.6 12 20 12 20Z" />
    </svg>
  );
}

// Product 카드 플랫폼 뱃지용 — 작은 사이즈에서 잘 읽히도록 선(stroke)이 아닌 채움(fill) 스타일.
// 특정 브랜드 로고를 그대로 복제한 게 아니라, 이 프로젝트 톤에 맞게 새로 그린 단순화된 심볼.
export function AppStoreBadgeIcon({ className }: { className?: string }) {
  // 로고 도형 자체가 24x24 뷰박스 중앙에서 살짝(우상단으로) 치우쳐 있어서 viewBox를 도형의
  // 실제 중심(bbox center ≈ 12.99, 11.2)에 맞춰 이동 — 아이콘이 원(배경 서클)에 꽉 차는
  // 지금 크기에서는 이 정도 오차도 육안으로 티가 나서 보정함.
  return (
    <svg className={className} viewBox="0.99 -0.8 24 24" fill="currentColor">
      <path d="M15.4 8.1c-.9-.1-1.7.4-2.2.4-.5 0-1.2-.4-2-.4-1 0-2 .6-2.5 1.5-1.1 1.9-.3 4.7.8 6.2.5.8 1.1 1.6 1.9 1.6.7 0 1-.5 1.9-.5s1.1.5 1.9.5c.8 0 1.3-.7 1.8-1.5.6-.9.8-1.7.8-1.7-.1 0-1.6-.6-1.6-2.4 0-1.4 1.2-2.1 1.2-2.1-.6-.9-1.5-1.4-2-1.6Z" />
      <path d="M13.1 6.9c.4-.5.7-1.2.6-1.9-.6.1-1.3.4-1.7.9-.4.5-.7 1.1-.6 1.8.7.1 1.4-.3 1.7-.8Z" />
    </svg>
  );
}

export function GooglePlayBadgeIcon({ className }: { className?: string }) {
  // AppStoreBadgeIcon과 같은 이유로 viewBox를 도형 실제 중심(bbox center ≈ 12.46, 12)에 맞춤.
  return (
    <svg className={className} viewBox="0.46 0 24 24" fill="currentColor">
      <path d="M6.5 4.2c-.3.3-.5.7-.5 1.2v13.2c0 .5.2.9.5 1.2l7.6-7.8Z" />
      <path d="m14.9 12.6-2.5-2.5-6-3.5 8.5 6ZM6.4 19.8l6-3.5 2.5-2.5-8.5 6Z" />
      <path d="m15.7 11.3 2.7-1.6c.7-.4.7-1.4 0-1.8l-2.7-1.6-2.9 3Z" />
      <path d="m15.7 12.7-2.9 3 2.9-1.7 2.7-1.6c.7-.4.7-1.4 0-1.8Z" />
    </svg>
  );
}

export function WebBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.2 2.2 2.2 13.8 0 16M12 4c-2.2 2.2-2.2 13.8 0 16" />
    </svg>
  );
}

export function EtcBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3.5a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM12 10.3a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM12 17.1a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Z" />
    </svg>
  );
}

export function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
