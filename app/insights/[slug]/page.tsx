import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '../../lib/supabase';
import { CATEGORY_LABELS } from '@/app/lib/insightsCategories';
import { buildArticleSlug, parseArticleId } from '@/app/lib/articleSlug';
import ArticleBody from '../_components/ArticleBody';
import BackButton from '../_components/BackButton';
import ArticleEngagement from '../_components/ArticleEngagement';
import ArticleViewRecorder from '../_components/ArticleViewRecorder';
import { buildMetaDescription } from '../_components/metaDescription';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = parseArticleId(slug);

  if (id === null) {
    return { title: 'The PMPO' };
  }

  const { data: article } = await supabase.from('articles').select('title, content').eq('id', id).single();

  if (!article) {
    return { title: 'The PMPO' };
  }

  return {
    title: `${article.title} | The PMPO`,
    description: buildMetaDescription(article.content),
  };
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  // Next.js가 이 동적 세그먼트 값을 percent-encoded 상태 그대로 넘겨줄 때가 있어 직접 디코딩.
  const slug = decodeURIComponent(rawSlug);
  const id = parseArticleId(slug);

  if (id === null) notFound();

  const { data: article } = await supabase.from('articles').select('*').eq('id', id).single();

  if (!article) notFound();

  const canonicalSlug = buildArticleSlug(id, article.title);
  if (slug !== canonicalSlug) {
    // Location 헤더는 non-ASCII(한글)를 그대로 담지 못하므로 percent-encoding 필요.
    // 브라우저 주소창에는 다시 자동으로 디코딩되어 한글 그대로 표시됨.
    permanentRedirect(`/insights/${encodeURI(canonicalSlug)}`);
  }

  let authorNickname = article.author;
  let authorAvatarUrl: string | null = null;
  let authorBio: string | null = null;

  if (UUID_REGEX.test(article.author_id)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_url, bio')
      .eq('id', article.author_id)
      .maybeSingle();

    authorNickname = profile?.nickname ?? article.author;
    authorAvatarUrl = profile?.avatar_url ?? null;
    authorBio = profile?.bio ?? null;
  }

  const { data: commentsData } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', id)
    .order('created_at', { ascending: true });

  const comments = commentsData ?? [];

  const commentUserIds = Array.from(
    new Set(comments.map((c) => c.user_id).filter((uid) => uid && UUID_REGEX.test(uid)))
  );

  const commentNicknames: Record<string, string> = {};
  if (commentUserIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, nickname').in('id', commentUserIds);
    (profiles ?? []).forEach((p) => {
      commentNicknames[p.id] = p.nickname;
    });
  }

  const { data: articleLikes } = await supabase
    .from('likes')
    .select('id, user_id, comment_id')
    .eq('article_id', id);

  const commentIds = comments.map((c) => c.id);
  const { data: commentLikes } =
    commentIds.length > 0
      ? await supabase.from('likes').select('id, user_id, comment_id').in('comment_id', commentIds)
      : { data: [] };

  const categoryLabel = CATEGORY_LABELS[article.category as keyof typeof CATEGORY_LABELS];

  // 검색엔진용 Article 구조화 데이터(schema.org). </script>로 스크립트가 중간에 끊기지
  // 않도록(제목에 이론상 그 문자열이 들어갈 경우 대비) 이스케이프 처리.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.created_at,
    dateModified: article.created_at,
    author: { "@type": "Person", name: authorNickname },
    ...(article.image_url ? { image: [article.image_url] } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://thepmpo.com/insights/${encodeURI(canonicalSlug)}`,
    },
  };

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-8 pb-24 lg:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <ArticleViewRecorder articleId={id} />

      <BackButton label={categoryLabel} />

      <span className="block mb-3 text-xs font-bold text-ink-soft">{categoryLabel}</span>

      <h1 className="text-[48px] leading-tight font-bold text-ink mb-2">{article.title}</h1>

      <div className="flex justify-end mb-5 text-sm font-mono text-ink-soft">
        <span>
          {new Date(article.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {article.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt="" className="w-full rounded-lg mb-4 object-cover" />
      )}

      <div className="max-w-[880px]">
        <div className="flex items-start gap-16">
          <aside className="w-[160px] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-border shrink-0 overflow-hidden">
                {authorAvatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authorAvatarUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <Link href={`/profile/${article.author_id}`} className="text-sm font-bold text-ink hover:text-accent truncate">
                {authorNickname}
              </Link>
            </div>
            {authorBio && <p className="mt-2 text-xs leading-relaxed text-ink-soft">{authorBio}</p>}
          </aside>

          <div className="min-w-0 flex-1">
            <ArticleBody content={article.content} />
          </div>
        </div>

        <ArticleEngagement
          articleId={id}
          articleAuthorId={article.author_id}
          initialComments={comments}
          initialCommentNicknames={commentNicknames}
          initialArticleLikes={articleLikes ?? []}
          initialCommentLikes={commentLikes ?? []}
        />
      </div>
    </div>
  );
}
