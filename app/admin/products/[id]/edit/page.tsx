"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ProductForm from "../../_components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const productId = Number(params.id);

  return (
    <div>
      <Link href="/admin/products" className="inline-block mb-4 text-sm text-ink-soft hover:text-accent">
        ← Product 관리로
      </Link>

      <h2 className="text-base font-bold text-ink mb-4">서비스 수정</h2>

      <ProductForm productId={productId} />
    </div>
  );
}
