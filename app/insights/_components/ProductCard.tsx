"use client";

import { AppStoreBadgeIcon, GooglePlayBadgeIcon, WebBadgeIcon, EtcBadgeIcon } from "@/app/components/icons";

const PLATFORM_LABELS: Record<string, string> = {
  app_store: "App Store",
  google_play: "Google Play",
  web: "웹",
  etc: "기타",
};

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  if (platform === "app_store") return <AppStoreBadgeIcon className={className} />;
  if (platform === "google_play") return <GooglePlayBadgeIcon className={className} />;
  if (platform === "web") return <WebBadgeIcon className={className} />;
  return <EtcBadgeIcon className={className} />;
}

export type ProductPlatform = { platform: string; url: string };
export type Product = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  primary_link: string;
  product_categories: { name: string } | null;
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />

      <div className="absolute inset-x-0 bottom-0 p-4 pr-20">
        {product.product_categories?.name && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/70">
            {product.product_categories.name}
          </p>
        )}
        <h3 className="line-clamp-1 text-xl lg:text-4xl font-bold leading-snug text-white">{product.name}</h3>
        <p className="mt-1 line-clamp-2 hidden lg:block text-xs leading-5 text-white/85">{product.description}</p>
      </div>

      {product.product_platforms.length > 0 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {product.product_platforms.map((platform) => (
            <a
              key={platform.platform + platform.url}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              aria-label={PLATFORM_LABELS[platform.platform] ?? platform.platform}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
            >
              <PlatformIcon platform={platform.platform} className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
