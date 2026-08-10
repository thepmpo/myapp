// 본문 텍스트에 섞여 들어간 마크다운 이미지 문법(![설명](URL))을 실제 <img>로 렌더링.
// 이미지 문법 외 다른 마크다운(굵게, 링크 등)은 지원하지 않음 — 의도적으로 범위를 좁게 유지.

const IMAGE_MARKDOWN_REGEX = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

type ContentSegment = { type: "text"; value: string } | { type: "image"; alt: string; url: string };

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  IMAGE_MARKDOWN_REGEX.lastIndex = 0;
  while ((match = IMAGE_MARKDOWN_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: "image", alt: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  return segments;
}

export default function ArticleBody({ content }: { content: string }) {
  const segments = parseContent(content);

  return (
    <div className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap mb-5">
      {segments.map((segment, index) =>
        segment.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={index} src={segment.url} alt={segment.alt} className="block w-full h-auto rounded-lg my-4" />
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </div>
  );
}
