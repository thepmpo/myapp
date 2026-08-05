export default function Footer() {
  return (
    <footer className="bg-ink pb-24 lg:pb-8 mt-20">
      <div className="max-w-[1280px] mx-auto px-6 py-10 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 text-left">
          <p className="text-white font-bold">The PMPO</p>
          <p className="text-white/60 text-sm">더 나은 내일의 서비스를 위해 고민하는 사람들</p>
          <p className="text-white/60 text-sm">thepmpo.official@gmail.com</p>
          <p className="text-white/60 text-xs">김상현 · 480-30-01764 · © 2026 ThePMPO. All rights reserved.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-full border border-white/20" />
          <span className="w-8 h-8 rounded-full border border-white/20" />
        </div>
      </div>
    </footer>
  );
}
