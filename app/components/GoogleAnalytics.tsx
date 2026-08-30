"use client";

// GA4 연동. @next/third-parties의 GoogleAnalytics 컴포넌트 대신 gtag.js를 직접 로드하는 이유:
// (1) 관리자 계정/디버그 쿼리 조건에 따라 "스크립트 자체를 아예 로드하지 않기"가 필요한데
//     third-parties 컴포넌트는 그런 조건부 로드 훅을 제공하지 않음.
// (2) Next.js App Router는 클라이언트 사이드 라우팅이라 gtag.js의 기본 자동 page_view만으로는
//     라우트 이동 시 조회수가 잡히지 않음 — usePathname/useSearchParams로 직접 이벤트를 쏴야 함.
import Script from "next/script";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useWorkspaceData } from "@/app/components/home/WorkspaceDataContext";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_OPT_OUT_STORAGE_KEY = "pmpo_ga_opt_out";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// ?ga_debug=off로 접속하면 로컬스토리지에 옵트아웃 플래그를 저장해, 이후 방문에도
// (URL에 그 파라미터가 없어도) 계속 GA4 전송이 꺼진 상태를 유지함.
function isOptedOutInBrowser(): boolean {
  if (typeof window === "undefined") return true;

  const params = new URLSearchParams(window.location.search);
  if (params.get("ga_debug") === "off") {
    window.localStorage.setItem(GA_OPT_OUT_STORAGE_KEY, "1");
  }

  return window.localStorage.getItem(GA_OPT_OUT_STORAGE_KEY) === "1";
}

function GoogleAnalyticsPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      send_to: GA_MEASUREMENT_ID,
    });
    // 최초 로드 시 page_view는 아래 gtag('config', ..., { send_page_view: false })로 꺼뒀으므로,
    // 이 effect가 처음 실행될 때 한 번 쏘는 것도 정상 동작(=초기 진입 페이지뷰 기록).
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  const { isAdmin, authChecked } = useWorkspaceData();
  // 브라우저 체크(로컬스토리지)는 동기적으로 알 수 없으니(SSR에는 window가 없음) 기본값을
  // "옵트아웃된 것으로" 시작해서, 실제로 아니라는 게 확인되기 전까지는 스크립트를 안 띄움.
  const [optedOut, setOptedOut] = useState(true);

  useEffect(() => {
    setOptedOut(isOptedOutInBrowser());
  }, []);

  const shouldLoad = Boolean(GA_MEASUREMENT_ID) && authChecked && !isAdmin && !optedOut;

  if (!shouldLoad) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageview />
      </Suspense>
    </>
  );
}
