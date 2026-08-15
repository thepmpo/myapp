"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

type Product = {
  id: number;
  name: string;
  product_categories: { name: string } | null;
  created_at: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, product_categories(name), created_at")
      .order("id", { ascending: false });

    if (!error) setProducts((data as unknown as Product[]) || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id: number) => {
    if (!confirm("이 서비스를 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      await fetchProducts();
    }
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(23,27,35,0.045)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-ink">Product ({products.length})</h2>
        <Link
          href="/admin/products/new"
          className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover"
        >
          + 새 서비스 등록
        </Link>
      </div>

      {products.length === 0 && <p className="text-sm text-ink-soft">등록된 서비스가 없습니다</p>}

      <div className="flex flex-col">
        {products.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-3 py-3 ${
              i !== products.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="text-xs font-mono text-ink-soft">{p.product_categories?.name || "카테고리 없음"}</div>
              <div className="text-sm text-ink truncate">{p.name}</div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="px-2.5 py-1.5 rounded-md border border-border bg-surface text-ink-soft text-xs cursor-pointer hover:bg-black/[0.03]"
              >
                수정
              </Link>
              <button
                onClick={() => deleteProduct(p.id)}
                className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs cursor-pointer hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
