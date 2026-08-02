import Link from "next/link";
import ArticleForm from "../_components/ArticleForm";

export default function NewInsightArticlePage() {
  return (
    <div>
      <Link href="/admin/insights" className="inline-block mb-4 text-sm text-ink-soft hover:text-accent">
        ← Insights 관리로
      </Link>

      <h2 className="text-base font-bold text-ink mb-4">새 글 작성</h2>

      <ArticleForm />
    </div>
  );
}
