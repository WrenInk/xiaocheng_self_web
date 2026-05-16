import Link from "next/link";

export const metadata = {
  title: "About — Notes & Garden",
};

const links = [
  { label: "GitHub", href: "https://github.com" },
  { label: "Email", href: "mailto:hello@example.com" },
  { label: "RSS", href: "/rss.xml" },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex items-center px-6 sm:px-10 pt-24 pb-16">
      <div className="max-w-xl mx-auto">
        <div className="glass glass-inner-glow rounded-[28px] p-10 relative overflow-hidden">
          <span className="glass-gloss rounded-[28px]" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-soft)] mb-6 ring-1 ring-white/60 shadow-inner" />
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] mb-4 text-[var(--color-ink)]">
              About
            </h1>
            <div className="space-y-3 text-[15px] leading-[1.7] text-[var(--color-ink-soft)] font-[450]">
              <p>
                I write here as a way of slowing down — to notice what I&apos;ve
                actually learned, instead of letting it scatter.
              </p>
              <p>
                The garden metaphor is real: most pieces start as seedlings, a few
                become evergreens. None of it is finished.
              </p>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/50 border border-white/70 text-[12.5px] font-medium tracking-tight text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-white/70 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
