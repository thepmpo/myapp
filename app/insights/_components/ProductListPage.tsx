"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import ProductCard, { Product } from "./ProductCard";

export default function ProductListPage() {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      let admin = false;

      if (userData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userData.user.id)
          .maybeSingle();
        admin = !!profile?.is_admin;
      }

      // 화면단 게이트: 실제 데이터 차단은 products 테이블 RLS가 하고 있어서(0037),
      // 여기선 관리자가 아닌데 admin_only일 때 아예 fetch를 시도하지 않고 안내만 보여줌.
      const { data: setting } = await supabase
        .from("nav_menu_settings")
        .select("visibility")
        .eq("key", "product")
        .maybeSingle();

      if (!active) return;
      setIsAdmin(admin);

      if (setting?.visibility === "admin_only" && !admin) {
        setStatus("denied");
        return;
      }

      const { data: productRows } = await supabase
        .from("products")
        .select("id, name, description, image_url, primary_link, category, product_platforms(platform, url)")
        .order("id", { ascending: false });

      if (!active) return;
      setProducts((productRows as unknown as Product[]) || []);
      setStatus("allowed");
    };

    void init();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 xl:pl-24 pt-[66px] text-sm text-ink-soft">로딩중...</div>
    );
  }

  if (status === "denied") {
    return (
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 xl:pl-24 pt-[66px]">
        <p className="text-sm text-ink-soft">관리자만 볼 수 있는 페이지예요</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-5 sm:px-8 xl:pl-24">
      <div className="flex items-center justify-between pt-[66px] mb-5">
        <h1 className="text-2xl font-bold text-ink">Product</h1>

        {isAdmin && (
          <Link
            href="/admin/products/new"
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
          >
            + 새 서비스 등록
          </Link>
        )}
      </div>

      <div className="lg:hidden border-b border-border mb-5" />

      {products.length === 0 && <p className="text-sm text-ink-soft">아직 등록된 서비스가 없어요</p>}

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-16 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
