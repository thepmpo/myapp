import type { Metadata } from "next";
import ProductListPage from "../_components/ProductListPage";

export const metadata: Metadata = {
  title: "Product | The PMPO",
  description: "PM/PO들이 직접 만들고, 써보고, 소개하는 서비스를 만나보세요.",
};

export default function InsightsProductPage() {
  return <ProductListPage />;
}
