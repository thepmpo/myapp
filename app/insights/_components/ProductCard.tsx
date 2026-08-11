"use client";

const PLATFORM_LABELS: Record<string, string> = {
  app_store: "App Store",
  google_play: "Google Play",
  web: "웹",
  etc: "기타",
};

export type ProductPlatform = { platform: string; url: string };
export type Product = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  primary_link: string;
  category: string | null;
  product_platforms: ProductPlatform[];
};

export default function ProductCard({ product }: { product: Product }) {
  const openPrimaryLink = () => {
    window.open(product.primary_link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openPrimaryLink}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPrimaryLink();
        }
      }}
      className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-xl bg-[#eceae5]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image_url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-white">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/85">{product.description}</p>

        {product.product_platforms.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {product.product_platforms.map((platform) => (
              <a
                key={platform.platform + platform.url}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-white"
              >
                {PLATFORM_LABELS[platform.platform] ?? platform.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
