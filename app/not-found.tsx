import Link from "next/link";

export const metadata = {
  title: "404 — Notes & Garden",
};

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 pt-24 pb-16">
      <div className="max-w-md w-full">
        <div className="glass glass-inner-glow rounded-[28px] p-10 relative overflow-hidden text-center">
          <span className="glass-gloss rounded-[28px]" />
          <div className="relative z-10">
            <div className="text-[64px] leading-none font-semibold tracking-[-0.04em] text-[var(--color-accent)] mb-3">
              404
            </div>
            <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-ink)] mb-2">
              这里什么都没长出来
            </h1>
            <p className="text-[14px] leading-[1.7] text-[var(--color-ink-soft)] mb-8 font-[450]">
              你找的那一页可能还是颗未发芽的种子，或者搬到别处去了。
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold tracking-tight text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-deep)] transition-colors shadow-[0_8px_20px_-8px_rgba(184,89,60,0.5)]"
              >
                <span aria-hidden>←</span>
                回首页
              </Link>
              <Link
                href="/blog"
                className="text-[13px] font-medium tracking-tight text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors px-3 py-2"
              >
                去花园看看
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
