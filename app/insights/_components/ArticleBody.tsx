"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// 표준 마크다운(굵게/기울임/링크/소제목/이미지)은 react-markdown이 처리.
// 밑줄(++텍스트++)/하이라이트(==텍스트==)는 표준 마크다운에 없는 문법이라, 파싱 전에
// <u>/<mark> 태그로 미리 바꿔주고 rehype-raw로 통과시킴. rehype-sanitize가 그 두 태그
// 외의 다른 원시 HTML은 전부 걸러내는 안전장치 역할(관리자만 글을 쓸 수 있지만 이중 방어).
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u", "mark"],
};

function preprocess(content: string) {
  return content
    .replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>")
    .replace(/==([^=]+)==/g, "<mark>$1</mark>");
}

export default function ArticleBody({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-ink mb-5">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap mb-4 last:mb-0">{children}</p>,
          h1: ({ children }) => <h2 className="text-xl font-bold text-ink mt-6 mb-2">{children}</h2>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-ink mt-6 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold text-ink mt-5 mb-2">{children}</h3>,
          strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          mark: ({ children }) => <mark className="bg-accent/15 text-ink rounded-sm px-0.5">{children}</mark>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent-hover">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="block w-full h-auto rounded-lg my-4" />
          ),
        }}
      >
        {preprocess(content)}
      </ReactMarkdown>
    </div>
  );
}
