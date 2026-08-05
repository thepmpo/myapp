"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { WorkspaceNavigation } from "@/app/components/home/WorkspaceFrame";
import type { HomeArticle, HomePost } from "@/app/components/home/types";
import LoginPromptModal from "@/app/components/LoginPromptModal";

type EditorialArticle = HomeArticle & { isFallback?: boolean };
type EditorialPost = HomePost & { isFallback?: boolean };
type CountMap = Record<number, number>;

const FALLBACK_ARTICLES: EditorialArticle[] = [
    {
        id: -101,
        title: "제품을 성장시키는 질문은 어디에서 시작될까",
        content: "좋은 제품은 명확한 답보다 더 좋은 질문에서 시작합니다. 팀이 함께 문제를 발견하고 결정하는 방법을 살펴봅니다.",
        category: "product",
        author: "The PMPO",
        author_id: "fallback",
        image_url: null,
        created_at: "2026-08-02T09:00:00.000Z",
        isFallback: true,
    },
    {
        id: -102,
        title: "변화의 속도보다 중요한 것",
        content: "새로운 기술과 고객 행동 사이에서 제품 조직이 놓치지 말아야 할 기준을 정리했습니다.",
        category: "trend",
        author: "The PMPO",
        author_id: "fallback",
        image_url: null,
        created_at: "2026-08-01T09:00:00.000Z",
        isFallback: true,
    },
    {
        id: -103,
        title: "AI 시대, 기획자의 판단은 어떻게 달라지는가",
        content: "AI를 도구로 활용하면서도 제품의 맥락과 사람의 경험을 지키는 실무 원칙을 이야기합니다.",
        category: "ai",
        author: "The PMPO",
        author_id: "fallback",
        image_url: null,
        created_at: "2026-07-31T09:00:00.000Z",
        isFallback: true,
    },
];

const FALLBACK_POSTS: EditorialPost[] = [
    { id: -201, title: "좋은 회고를 만드는 질문을 공유해요", content: null, author: "PMPO Circle", user_id: "fallback", is_question: true, image_url: null, created_at: "2026-08-02T08:00:00.000Z", isFallback: true },
    { id: -202, title: "신규 기능 우선순위는 어떻게 정하시나요?", content: null, author: "PMPO Circle", user_id: "fallback", is_question: true, image_url: null, created_at: "2026-08-01T08:00:00.000Z", isFallback: true },
    { id: -203, title: "데이터가 부족할 때 의사결정하는 법", content: null, author: "PMPO Circle", user_id: "fallback", is_question: false, image_url: null, created_at: "2026-07-31T08:00:00.000Z", isFallback: true },
    { id: -204, title: "팀의 공통 언어를 만드는 작은 습관", content: null, author: "PMPO Circle", user_id: "fallback", is_question: false, image_url: null, created_at: "2026-07-30T08:00:00.000Z", isFallback: true },
    { id: -205, title: "이번 주 가장 인상 깊었던 제품 경험", content: null, author: "PMPO Circle", user_id: "fallback", is_question: false, image_url: null, created_at: "2026-07-29T08:00:00.000Z", isFallback: true },
];

const dateValue = (value?: string | null) => value ? new Date(value).getTime() : 0;
const excerpt = (value: string | null, length = 112) => {
    const cleaned = (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return cleaned.length > length ? cleaned.slice(0, length).trimEnd() + "…" : cleaned;
};

function Artwork({ article, large = false }: { article: EditorialArticle; large?: boolean }) {
    if (article.image_url) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        );
    }

    const tone = article.category === "product" ? "from-[#b7442d] via-[#e9aa6a] to-[#f1ddd0]" : article.category === "trend" ? "from-[#244d61] via-[#74a2a1] to-[#d9e2d9]" : "from-[#4a355f] via-[#9a6f9f] to-[#e6d5df]";
    return (
        <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${tone}`} aria-hidden="true">
            <div className="absolute -right-[12%] -top-[18%] h-[65%] w-[65%] rounded-full border border-white/50 bg-white/10" />
            <div className="absolute bottom-[9%] left-[9%] h-[34%] w-[44%] border border-white/55 bg-black/10 backdrop-blur-[1px]" />
            <span className={`absolute bottom-[10%] right-[9%] font-serif font-bold tracking-[-0.06em] text-white/90 ${large ? "text-5xl md:text-7xl" : "text-4xl"}`}>P</span>
        </div>
    );
}

export default function EditorialHome() {
    const [articles, setArticles] = useState<EditorialArticle[]>(FALLBACK_ARTICLES);
    const [posts, setPosts] = useState<EditorialPost[]>(FALLBACK_POSTS);
    const [articleLikes, setArticleLikes] = useState<CountMap>({});
    const [postComments, setPostComments] = useState<CountMap>({});
    const [postLikes, setPostLikes] = useState<CountMap>({});
    const [nicknames, setNicknames] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
    const [myNickname, setMyNickname] = useState("");
    const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        let active = true;

        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!active || !data.user) return;
            setCurrentUser({ id: data.user.id, email: data.user.email ?? "" });
            const { data: profile } = await supabase.from("profiles").select("nickname, avatar_url").eq("id", data.user.id).maybeSingle();
            if (active) {
                setMyNickname(profile?.nickname ?? "");
                setMyAvatarUrl(profile?.avatar_url ?? null);
            }
        };

        void loadUser();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setArticles(FALLBACK_ARTICLES);
            setPosts(FALLBACK_POSTS);
            setIsLoading(false);
            const [{ data: articleData }, { data: postData }] = await Promise.all([
                supabase.from("articles").select("*").in("category", ["product", "trend", "ai"]),
                supabase.from("posts").select("*"),
            ]);

            const realArticles = (articleData as EditorialArticle[] | null) ?? [];
            const realPosts = (postData as EditorialPost[] | null) ?? [];
            const articleIds = realArticles.map((article) => article.id);
            const postIds = realPosts.map((post) => post.id);

            const [{ data: likeData }, { data: commentData }, { data: postLikeData }] = await Promise.all([
                articleIds.length ? supabase.from("likes").select("article_id").in("article_id", articleIds) : Promise.resolve({ data: [] }),
                postIds.length ? supabase.from("comments").select("post_id").in("post_id", postIds) : Promise.resolve({ data: [] }),
                postIds.length ? supabase.from("likes").select("post_id").in("post_id", postIds) : Promise.resolve({ data: [] }),
            ]);

            const likes: CountMap = {};
            (likeData ?? []).forEach((row: { article_id: number | null }) => {
                if (row.article_id != null) likes[row.article_id] = (likes[row.article_id] ?? 0) + 1;
            });
            const comments: CountMap = {};
            (commentData ?? []).forEach((row: { post_id: number | null }) => {
                if (row.post_id != null) comments[row.post_id] = (comments[row.post_id] ?? 0) + 1;
            });
            const postReactions: CountMap = {};
            (postLikeData ?? []).forEach((row: { post_id: number | null }) => {
                if (row.post_id != null) postReactions[row.post_id] = (postReactions[row.post_id] ?? 0) + 1;
            });

            const userIds = Array.from(new Set([...realArticles.map((article) => article.author_id), ...realPosts.map((post) => post.user_id)].filter((id) => /^[0-9a-f-]{36}$/i.test(id))));
            const { data: profileData } = userIds.length ? await supabase.from("profiles").select("id, nickname").in("id", userIds) : { data: [] };
            const names: Record<string, string> = {};
            (profileData ?? []).forEach((profile: { id: string; nickname: string }) => { names[profile.id] = profile.nickname; });

            if (!active) return;
            setArticles(realArticles.length ? realArticles : FALLBACK_ARTICLES);
            setPosts(realPosts.length ? realPosts : FALLBACK_POSTS);
            setArticleLikes(likes);
            setPostComments(comments);
            setPostLikes(postReactions);
            setNicknames(names);
            setIsLoading(false);
        };

        void load();
        return () => { active = false; };
    }, []);

    const { latest, hero, recent } = useMemo(() => {
        const newest = [...articles].sort((a, b) => dateValue(b.created_at) - dateValue(a.created_at) || b.id - a.id);
        const best = [...articles].sort((a, b) => (articleLikes[b.id] ?? 0) - (articleLikes[a.id] ?? 0) || dateValue(b.created_at) - dateValue(a.created_at) || b.id - a.id)[0] ?? FALLBACK_ARTICLES[0];
        const featured = posts
            .filter((post) => post.isFallback || post.is_featured)
            .sort((a, b) => dateValue(b.created_at) - dateValue(a.created_at) || b.id - a.id)
            .slice(0, 5);
        return { latest: newest.slice(0, 2), hero: best, recent: featured };
    }, [articles, articleLikes, posts]);

    const articleHref = (article: EditorialArticle) => article.isFallback ? "/insights/" + article.category : "/insights/" + article.id;
    const postHref = (post: EditorialPost) => post.isFallback ? "/" : "/post/" + post.id;

    const handlePostClick = (event: React.MouseEvent, post: EditorialPost) => {
        if (!post.isFallback && !currentUser) {
            event.preventDefault();
            setShowLoginPrompt(true);
        }
    };

    return (
        <div className="min-h-screen overflow-x-clip bg-white text-[#161616]">
            <header className="relative border-t-[3px] border-black bg-white">
                <div className="relative mx-auto flex h-[112px] max-w-[1320px] items-start px-5 pt-6 sm:px-8 md:h-[184px] md:pt-12">
                    <button type="button" onClick={() => setIsMenuOpen(true)} aria-label="주요 메뉴 열기" className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center text-black">
                        <span className="flex w-5 flex-col gap-[5px]" aria-hidden="true"><span className="h-px bg-current" /><span className="h-px bg-current" /><span className="h-px bg-current" /></span>
                    </button>
                    <Link href="/home" className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap font-serif text-[36px] font-bold leading-none tracking-[-0.055em] md:top-12 md:text-[86px]">The PMPO</Link>
                    {currentUser ? (
                        <Link href={"/profile/" + currentUser.id} className="ml-auto hidden items-center gap-2 pt-1 text-[13px] font-medium text-[#161616]/80 hover:text-black md:flex">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eceae5] text-xs font-bold text-black">
                                {myAvatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={myAvatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    (myNickname || currentUser.email || "").slice(0, 1).toUpperCase()
                                )}
                            </span>
                            <span className="hidden max-w-24 truncate sm:inline">{myNickname || "마이페이지"}</span>
                        </Link>
                    ) : (
                        <Link href="/login" className="ml-auto pt-2 text-[13px] font-medium text-[#161616]/80 hover:text-black hover:underline underline-offset-4">Sign in</Link>
                    )}
                </div>
            </header>

            <div className="border-b border-black/10 bg-accent text-white">
                <div className="mx-auto max-w-[1320px] px-5 py-10 text-center sm:px-8 sm:py-14">
                    <p className="whitespace-nowrap text-[15px] font-bold tracking-[-0.02em] sm:text-[28px]">가장 최신의 트렌드와 AI 정보 그리고 커뮤니티까지</p>
                    <p className="mt-2 text-sm text-white/85 sm:text-base">지금 바로 The PMPO에서 만나보세요.</p>
                </div>
            </div>

            <main className="mx-auto w-full max-w-[1320px] px-5 pb-20 sm:px-8">
                <div className="border-y border-[#deddd9]">
                    {isLoading ? (
                        <div className="grid min-h-[560px] animate-pulse gap-px bg-[#deddd9] lg:grid-cols-[300px_minmax(0,1fr)_320px]">
                            <div className="bg-white p-6"><div className="h-52 bg-[#f1f0ed]" /></div>
                            <div className="bg-white p-6"><div className="aspect-[4/3] bg-[#f1f0ed]" /></div>
                            <div className="bg-white p-6"><div className="h-72 bg-[#f1f0ed]" /></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
                            <section className="min-w-0 order-2 border-t border-[#deddd9] py-8 md:border-r md:border-t-0 md:pr-8 lg:order-1 lg:py-10 lg:pr-9" aria-label="최신 아티클">
                                <div className="space-y-9">
                                    {latest.map((article) => (
                                        <Link href={articleHref(article)} key={article.id} className="group block">
                                            <div className="aspect-[16/10] overflow-hidden bg-[#eceae5]"><Artwork article={article} /></div>
                                            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.13em] text-[#6c6a66]">{CATEGORY_LABELS[article.category]}</p>
                                            <h3 className="mt-2 text-[22px] font-bold leading-[1.25] tracking-[-0.02em]">{article.title}</h3>
                                            <p className="mt-2 line-clamp-3 text-[13px] leading-[1.6] text-[#696762]">{excerpt(article.content, 100)}</p>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <section className="min-w-0 order-1 border-b border-[#deddd9] py-8 md:col-span-2 md:py-10 lg:order-2 lg:col-span-1 lg:border-b-0 lg:px-10" aria-label="대표 콘텐츠">
                                <Link href={articleHref(hero)} className="group block">
                                    <div className="aspect-[4/3] overflow-hidden bg-[#eceae5]"><Artwork article={hero} large /></div>
                                    <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6c6a66]">{CATEGORY_LABELS[hero.category]}</p>
                                    <h1 className="mt-3 max-w-[720px] text-[32px] font-bold leading-[1.2] tracking-[-0.025em] sm:text-[40px] lg:text-[36px]">{hero.title}</h1>
                                    <p className="mt-4 max-w-[630px] text-[15px] leading-[1.7] text-[#66645f]">{excerpt(hero.content, 170)}</p>
                                    <p className="mt-5 text-[12px] text-[#77746e]">{nicknames[hero.author_id] ?? hero.author}</p>
                                </Link>
                            </section>

                            <aside className="min-w-0 order-3 border-t border-[#deddd9] py-8 md:border-t-0 md:pl-8 lg:border-l lg:py-10 lg:pl-9" aria-label="지금 인기 있는 Circle 글">
                                {recent.length === 0 && <p className="text-sm text-[#77746e]">아직 소개할 글이 없어요.</p>}
                                <ol>
                                    {recent.map((post) => (
                                        <li key={post.id} className="border-t border-[#deddd9] py-5 first:border-t-0 first:pt-1">
                                            <Link href={postHref(post)} onClick={(event) => handlePostClick(event, post)} className="group block">
                                                <strong className="block text-[17px] font-bold leading-[1.3] tracking-[-0.01em] group-hover:underline">{post.title}</strong>
                                                <span className="mt-2 flex items-center gap-1.5 text-[11px] leading-5 text-[#77746e]">
                                                    <span>{nicknames[post.user_id] ?? post.author}</span>
                                                    <span aria-hidden="true">·</span>
                                                    <span>🙌 {postLikes[post.id] ?? 0}</span>
                                                    <span>💬 {postComments[post.id] ?? 0}</span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            <div className={`fixed inset-0 z-[70] ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isMenuOpen}>
                <button type="button" aria-label="메뉴 닫기" onClick={() => setIsMenuOpen(false)} className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} />
                <aside className={`absolute inset-y-0 left-0 w-[min(82vw,218px)] border-r border-[#f1efed] bg-surface px-5 py-6 shadow-xl transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="mb-8 flex items-center justify-between">
                        <Link href="/home" onClick={() => setIsMenuOpen(false)} className="font-serif text-2xl font-bold tracking-[-0.04em]">The PMPO</Link>
                        <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="내비게이션 닫기" className="h-9 w-9 text-xl text-ink-soft">×</button>
                    </div>
                    <WorkspaceNavigation onNavigate={() => setIsMenuOpen(false)} />
                </aside>
            </div>

            {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
        </div>
    );
}
