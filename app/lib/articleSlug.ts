// Trends/AI 아티클 상세 URL을 "/insights/{id}-{제목 슬러그}" 형태로 만들기 위한 헬퍼.
// 슬러그는 DB에 저장하지 않고 제목에서 그때그때 만들어냄 — 페이지를 찾을 때는
// 맨 앞 숫자(id)만 보고, 슬러그 부분은 정확히 일치하지 않아도(오래된 링크, 제목 변경 등)
// 페이지가 정상적으로 열리도록 함(불일치 시 정식 주소로 리다이렉트만 함).
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildArticleSlug(id: number, title: string): string {
  const slug = slugifyTitle(title);
  return slug ? `${id}-${slug}` : `${id}`;
}

export function parseArticleId(slugParam: string): number | null {
  const match = slugParam.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}
