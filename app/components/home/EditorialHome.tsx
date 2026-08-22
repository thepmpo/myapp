"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { CATEGORY_LABELS } from "@/app/lib/insightsCategories";
import { buildArticleSlug } from "@/app/lib/articleSlug";
import { WorkspaceNavigation } from "@/app/components/home/WorkspaceFrame";
import type { HomeArticle, HomePost } from "@/app/components/home/types";
import LoginPromptModal from "@/app/components/LoginPromptModal";
import ProfileMenu from "@/app/components/ProfileMenu";
import { LikeIcon } from "@/app/components/icons";

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

type HomeSlotKey = "left_1" | "left_2" | "hero" | "circle_1" | "circle_2" | "circle_3" | "circle_4" | "circle_5";
type HomeSlotRow = { slot_key: HomeSlotKey; content_type: "article" | "post" | null; content_id: number | null };

const LEFT_SLOT_KEYS: HomeSlotKey[] = ["left_1", "left_2"];
const CIRCLE_SLOT_KEYS: HomeSlotKey[] = ["circle_1", "circle_2", "circle_3", "circle_4", "circle_5"];

export default function EditorialHome() {
    // 홈 화면 8개 영역(좌측 아티클 2/중앙 대표 1/우측 Circle 인기글 5)은 이제 관리자가
    // `/admin/home-content`에서 직접 지정한 콘텐츠만 노출함(예전의 "최신순"/"좋아요순" 자동 계산 방식 폐기).
    // 슬롯이 비어있으면 아래 fallback 콘텐츠로 대체되어 빈 화면이 뜨지 않게 함.
    const [latest, setLatest] = useState<EditorialArticle[]>([FALLBACK_ARTICLES[1], FALLBACK_ARTICLES[2]]);
    const [hero, setHero] = useState<EditorialArticle>(FALLBACK_ARTICLES[0]);
    const [recent, setRecent] = useState<EditorialPost[]>(FALLBACK_POSTS);
    const [postComments, setPostComments] = useState<CountMap>({});
    const [postLikes, setPostLikes] = useState<CountMap>({});
    const [nicknames, setNicknames] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
    const [myNickname, setMyNickname] = useState("");
    const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        let active = true;

        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!active || !data.user) return;
            setCurrentUser({ id: data.user.id, email: data.user.email ?? "" });
            const { data: profile } = await supabase.from("profiles").select("nickname, avatar_url, is_admin").eq("id", data.user.id).maybeSingle();
            if (active) {
                setMyNickname(profile?.nickname ?? "");
                setMyAvatarUrl(profile?.avatar_url ?? null);
                setIsAdmin(!!profile?.is_admin);
            }
        };

        void loadUser();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setIsLoading(false);

            const { data: slotData } = await supabase
                .from("home_slots")
                .select("slot_key, content_type, content_id");
            const slots = (slotData as HomeSlotRow[] | null) ?? [];
            const slotByKey = new Map(slots.map((s) => [s.slot_key, s]));

            const articleIds = LEFT_SLOT_KEYS.concat("hero")
                .map((key) => slotByKey.get(key))
                .filter((s): s is HomeSlotRow => !!s && s.content_type === "article" && s.content_id != null)
                .map((s) => s.content_id as number);
            const postIds = CIRCLE_SLOT_KEYS.map((key) => slotByKey.get(key))
                .filter((s): s is HomeSlotRow => !!s && s.content_type === "post" && s.content_id != null)
                .map((s) => s.content_id as number);

            const [{ data: articleData }, { data: postData }] = await Promise.all([
                articleIds.length ? supabase.from("articles").select("*").in("id", articleIds) : Promise.resolve({ data: [] }),
                postIds.length ? supabase.from("posts").select("*").in("id", postIds) : Promise.resolve({ data: [] }),
            ]);

            const articleById = new Map(((articleData as EditorialArticle[] | null) ?? []).map((a) => [a.id, a]));
            const postById = new Map(((postData as EditorialPost[] | null) ?? []).map((p) => [p.id, p]));

            const resolveArticle = (key: HomeSlotKey, fallback: EditorialArticle) => {
                const slot = slotByKey.get(key);
                if (slot?.content_type === "article" && slot.content_id != null) {
                    const found = articleById.get(slot.content_id);
                    if (found) return found;
                }
                return fallback;
            };
            const resolvePost = (key: HomeSlotKey, fallback: EditorialPost) => {
                const slot = slotByKey.get(key);
                if (slot?.content_type === "post" && slot.content_id != null) {
                    const found = postById.get(slot.content_id);
                    if (found) return found;
                }
                return fallback;
            };

            const resolvedLatest = [
                resolveArticle("left_1", FALLBACK_ARTICLES[1]),
                resolveArticle("left_2", FALLBACK_ARTICLES[2]),
            ];
            const resolvedHero = resolveArticle("hero", FALLBACK_ARTICLES[0]);
            const resolvedRecent = CIRCLE_SLOT_KEYS.map((key, i) => resolvePost(key, FALLBACK_POSTS[i]));

            const realPostIds = resolvedRecent.filter((p) => !p.isFallback).map((p) => p.id);

            const [{ data: commentData }, { data: postLikeData }] = await Promise.all([
                realPostIds.length ? supabase.from("comments").select("post_id").in("post_id", realPostIds) : Promise.resolve({ data: [] }),
                realPostIds.length ? supabase.from("likes").select("post_id").in("post_id", realPostIds) : Promise.resolve({ data: [] }),
            ]);

            const comments: CountMap = {};
            (commentData ?? []).forEach((row: { post_id: number | null }) => {
                if (row.post_id != null) comments[row.post_id] = (comments[row.post_id] ?? 0) + 1;
            });
            const postReactions: CountMap = {};
            (postLikeData ?? []).forEach((row: { post_id: number | null }) => {
                if (row.post_id != null) postReactions[row.post_id] = (postReactions[row.post_id] ?? 0) + 1;
            });

            const userIds = Array.from(
                new Set(
                    [resolvedHero, ...resolvedLatest]
                        .map((article) => article.author_id)
                        .concat(resolvedRecent.map((post) => post.user_id))
                        .filter((id) => /^[0-9a-f-]{36}$/i.test(id))
                )
            );
            const { data: profileData } = userIds.length ? await supabase.from("profiles").select("id, nickname").in("id", userIds) : { data: [] };
            const names: Record<string, string> = {};
            (profileData ?? []).forEach((profile: { id: string; nickname: string }) => { names[profile.id] = profile.nickname; });

            if (!active) return;
            setLatest(resolvedLatest);
            setHero(resolvedHero);
            setRecent(resolvedRecent);
            setPostComments(comments);
            setPostLikes(postReactions);
            setNicknames(names);
            setIsLoading(false);
        };

        void load();
        return () => { active = false; };
    }, []);

    const articleHref = (article: EditorialArticle) => article.isFallback ? "/insights/" + article.category : "/insights/" + buildArticleSlug(article.id, article.title);
    const postHref = (post: EditorialPost) => post.isFallback ? "/circle" : "/post/" + post.id;

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
                    <Link href="/" className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap font-serif text-[36px] font-bold leading-none tracking-[-0.055em] md:top-12 md:text-[86px]">The PMPO</Link>
                    {currentUser ? (
                        <ProfileMenu userId={currentUser.id} isAdmin={isAdmin} className="ml-auto hidden md:block">
                            <span className="flex items-center gap-2 pt-1 text-[13px] font-medium text-[#161616]/80 hover:text-black">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eceae5] text-xs font-bold text-black">
                                    {myAvatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={myAvatarUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        (myNickname || currentUser.email || "").slice(0, 1).toUpperCase()
                                    )}
                                </span>
                                <span className="hidden max-w-24 truncate sm:inline">{myNickname || "마이페이지"}</span>
                            </span>
                        </ProfileMenu>
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
                                                <span className="mt-2 block text-[11px] leading-5 text-[#77746e]">{nicknames[post.user_id] ?? post.author}</span>
                                                <span className="mt-1.5 flex items-center justify-end gap-3 text-[11px] leading-5 text-[#77746e]">
                                                    <span className="flex items-center gap-1">
                                                        <LikeIcon />
                                                        {postLikes[post.id] ?? 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                                            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                                                        </svg>
                                                        {postComments[post.id] ?? 0}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ol>

                                <Link
                                    href="/circle"
                                    className="mt-7 flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
                                >
                                    소통하러 가기
                                </Link>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            <div className={`fixed inset-0 z-[70] ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isMenuOpen}>
                <button type="button" aria-label="메뉴 닫기" onClick={() => setIsMenuOpen(false)} className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} />
                <aside className={`absolute inset-y-0 left-0 w-[min(82vw,218px)] border-r border-[#f1efed] bg-surface px-5 py-6 shadow-xl transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="mb-8 flex items-center justify-between">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="font-serif text-2xl font-bold tracking-[-0.04em]">The PMPO</Link>
                        <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="내비게이션 닫기" className="h-9 w-9 text-xl text-ink-soft">×</button>
                    </div>
                    <WorkspaceNavigation onNavigate={() => setIsMenuOpen(false)} />
                </aside>
            </div>

            {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
        </div>
    );
}
