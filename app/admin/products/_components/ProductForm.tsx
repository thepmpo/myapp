"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Platform = "app_store" | "google_play" | "web" | "etc";
const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "app_store", label: "App Store" },
  { value: "google_play", label: "Google Play" },
  { value: "web", label: "웹" },
  { value: "etc", label: "기타" },
];

type PlatformRow = { platform: Platform; url: string };
type CategoryOption = { id: number; name: string };
type SubcategoryOption = { id: number; name: string; category_id: number };

export default function ProductForm({ productId }: { productId?: number }) {
  const router = useRouter();
  const isEdit = productId != null;

  const [loading, setLoading] = useState(isEdit);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryLink, setPrimaryLink] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformRow[]>([{ platform: "app_store", url: "" }]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUser({ id: data.user.id });

      const { data: categoryRows } = await supabase.from("product_categories").select("id, name").order("name");
      setCategories((categoryRows as CategoryOption[]) || []);

      if (isEdit) {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("*, product_platforms(platform, url)")
          .eq("id", productId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else if (product) {
          setName(product.name);
          setDescription(product.description);
          setPrimaryLink(product.primary_link);
          setCategoryId(product.category_id ?? null);
          setSubcategoryId(product.subcategory_id ?? null);
          setExistingImageUrl(product.image_url);
          if (product.product_platforms?.length > 0) {
            setPlatforms(product.product_platforms.map((p: PlatformRow) => ({ platform: p.platform, url: p.url })));
          }
        }

        setLoading(false);
      }
    };

    init();
  }, [productId, isEdit]);

  // 선택된 메인 카테고리가 바뀔 때마다 그 하위 세부 카테고리 목록을 다시 불러옴.
  useEffect(() => {
    if (categoryId == null) {
      setSubcategories([]);
      return;
    }

    let active = true;
    supabase
      .from("product_subcategories")
      .select("id, name, category_id")
      .eq("category_id", categoryId)
      .order("name")
      .then(({ data }) => {
        if (active) setSubcategories((data as SubcategoryOption[]) || []);
      });

    return () => {
      active = false;
    };
  }, [categoryId]);

  const updatePlatform = (index: number, patch: Partial<PlatformRow>) => {
    setPlatforms((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addPlatformRow = () => {
    setPlatforms((prev) => [...prev, { platform: "app_store", url: "" }]);
  };

  const removePlatformRow = (index: number) => {
    setPlatforms((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!currentUser) {
      setError("로그인이 필요합니다");
      return;
    }

    const validPlatforms = platforms.filter((p) => p.url.trim() !== "");

    if (!name || !description || !primaryLink || (!imageFile && !existingImageUrl)) {
      setError("서비스명, 소개, 대표 링크, 이미지를 모두 입력하세요");
      return;
    }

    setError("");

    let imageUrl = existingImageUrl;

    if (imageFile) {
      setUploading(true);

      const extension = imageFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${currentUser.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(path, imageFile);

      setUploading(false);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
    }

    let targetProductId = productId;

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name,
          description,
          primary_link: primaryLink,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          image_url: imageUrl,
        })
        .eq("id", productId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      const { error: deletePlatformsError } = await supabase
        .from("product_platforms")
        .delete()
        .eq("product_id", productId);

      if (deletePlatformsError) {
        setError(deletePlatformsError.message);
        return;
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert([
          {
            name,
            description,
            primary_link: primaryLink,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            image_url: imageUrl,
            author_id: currentUser.id,
          },
        ])
        .select("id")
        .single();

      if (insertError || !inserted) {
        setError(insertError?.message ?? "등록에 실패했습니다");
        return;
      }

      targetProductId = inserted.id;
    }

    if (validPlatforms.length > 0 && targetProductId != null) {
      const { error: platformsError } = await supabase
        .from("product_platforms")
        .insert(validPlatforms.map((p) => ({ product_id: targetProductId, platform: p.platform, url: p.url })));

      if (platformsError) {
        setError(platformsError.message);
        return;
      }
    }

    router.push("/admin/products");
  };

  if (loading) return <div className="text-sm text-ink-soft">로딩중...</div>;

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <input
        placeholder="서비스명"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <textarea
        placeholder="서비스 간략 소개 (한두 줄)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 min-h-[64px] focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <input
        placeholder="대표 링크 (카드 클릭 시 이동할 URL)"
        value={primaryLink}
        onChange={(e) => setPrimaryLink(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft mb-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      <div className="flex gap-2 mb-3">
        <select
          value={categoryId ?? ""}
          onChange={(e) => {
            const id = e.target.value === "" ? null : Number(e.target.value);
            setCategoryId(id);
            setSubcategoryId(null);
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">카테고리 선택 안 함</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={subcategoryId ?? ""}
          onChange={(e) => setSubcategoryId(e.target.value === "" ? null : Number(e.target.value))}
          disabled={categoryId == null}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:bg-border/30 disabled:text-ink-soft disabled:cursor-not-allowed"
        >
          <option value="">세부 카테고리 선택 안 함</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-ink-soft">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="text-xs text-ink-soft file:mr-2 file:px-2.5 file:py-1.5 file:rounded-md file:border file:border-border file:bg-surface file:text-xs file:text-ink-soft file:cursor-pointer cursor-pointer"
        />
        {imageFile ? <span>{imageFile.name}</span> : existingImageUrl && <span>기존 이미지 유지</span>}
        {uploading && <span>업로드 중...</span>}
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-bold text-ink-soft">플랫폼 / 링크</p>

        <div className="flex flex-col gap-2">
          {platforms.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={row.platform}
                onChange={(e) => updatePlatform(index, { platform: e.target.value as Platform })}
                className="px-2.5 py-2 rounded-lg border border-border bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                placeholder="스토어 링크 URL"
                value={row.url}
                onChange={(e) => updatePlatform(index, { url: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
              />

              {platforms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePlatformRow(index)}
                  className="px-2.5 py-2 rounded-md border border-border bg-surface text-ink-soft text-xs cursor-pointer hover:bg-black/[0.03]"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPlatformRow}
          className="mt-2 px-3 py-1.5 rounded-md border border-border bg-surface text-xs text-ink-soft hover:bg-black/[0.03] cursor-pointer"
        >
          + 플랫폼 추가
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <button
        onClick={submit}
        className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-[0_2px_0_rgba(23,27,35,0.15)] hover:bg-accent-hover cursor-pointer"
      >
        {isEdit ? "저장" : "등록"}
      </button>
    </div>
  );
}
