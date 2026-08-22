// 검색결과 설명(meta description)용으로 마크다운 문법을 제거하고 다듬어 자르는 함수.
// 화면에 보이는 excerpt.ts와 달리, 여기선 ![이미지](url)/[링크](url)/**굵게** 같은
// 마크다운 기호가 그대로 노출되면 검색결과가 지저분해 보이므로 먼저 걷어내고 자름.
export function buildMetaDescription(content: string, length = 120) {
  const plain = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\+\+([^+]+)\+\+/g, "$1")
    .replace(/==([^=]+)==/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > length ? plain.slice(0, length).trimEnd() + "…" : plain;
}
