"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ArticleForm from "../../_components/ArticleForm";

export default function EditInsightArticlePage() {
  const params = useParams();
  const articleId = Number(params.id);

  return (
    <div>
      <Link href="/admin/insights" className="inline-block mb-4 text-sm text-ink-soft hover:text-accent">
        ← Insights 관리로
      </Link>

      <h2 className="text-base font-bold text-ink mb-4">글 수정</h2>

      <ArticleForm articleId={articleId} />
    </div>
  );
}
