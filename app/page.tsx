import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="min-h-dvh flex flex-col">
      <section className="flex-1 flex items-center px-6 sm:px-10">
        <div className="max-w-2xl mx-auto pt-32 pb-20">
          <h1 className="text-[44px] sm:text-[56px] leading-[1.05] font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            A quiet place to think
            <br />
            <span className="text-[var(--color-ink-muted)]">in public.</span>
          </h1>

          <div className="mt-8 space-y-4 text-[17px] leading-[1.7] text-[var(--color-ink-soft)] max-w-[44ch] font-[450]">
            <p>
              I write notes while I learn — about software, interfaces, and the small
              decisions that quietly shape how a product feels. This is the slow,
              accumulating side of that.
            </p>
            <p>
              Some entries are half-formed seedlings; others have been tended for
              long enough to be worth returning to. Either way, you can wander.
            </p>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <Link
              href="/blog"
              className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold tracking-tight text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-deep)] transition-colors shadow-[0_10px_24px_-8px_rgba(184,89,60,0.5)] hover:shadow-[0_14px_30px_-8px_rgba(184,89,60,0.65)]"
            >
              Enter the garden
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/about"
              className="text-[14px] font-medium tracking-tight text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors px-3 py-2"
            >
              About
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[12px] uppercase tracking-[0.18em] font-medium text-[var(--color-ink-muted)]">
              Recent notes
            </h2>
            <Link
              href="/blog"
              className="text-[12px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              all →
            </Link>
          </div>
          <ul className="divide-y divide-[var(--color-rule)]">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex items-baseline justify-between gap-6 py-4 transition-colors"
                >
                  <span className="text-[15px] text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors tracking-tight">
                    {p.title}
                  </span>
                  <span className="text-[12px] tabular-nums text-[var(--color-ink-muted)] shrink-0">
                    {formatDate(p.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
