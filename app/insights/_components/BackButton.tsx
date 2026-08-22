'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-block mb-4 text-sm text-ink-soft hover:text-accent cursor-pointer"
    >
      ← {label}
    </button>
  );
}
