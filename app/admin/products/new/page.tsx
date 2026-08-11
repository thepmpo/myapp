import Link from "next/link";
import ProductForm from "../_components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-block mb-4 text-sm text-ink-soft hover:text-accent">
        ← Product 관리로
      </Link>

      <h2 className="text-base font-bold text-ink mb-4">새 서비스 등록</h2>

      <ProductForm />
    </div>
  );
}
