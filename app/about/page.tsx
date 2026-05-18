import Link from "next/link";

export const metadata = {
  title: "关于 — Notes & Garden",
};

const links = [
  { label: "GitHub", href: "https://github.com/WrenInk" },
];

const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex items-center px-6 sm:px-10 pt-24 pb-16">
      <div className="max-w-4xl mx-auto w-full">
        <div className="glass glass-inner-glow rounded-[28px] p-10 relative overflow-hidden">
          <span className="glass-gloss rounded-[28px]" />

          <div className="relative z-10 grid md:grid-cols-[220px_1fr] gap-10 items-start">
            
            {/* Left */}
            <div>
              <div
                role="img"
                aria-label="小城染墨"
                className="w-24 h-24 rounded-full mb-6 ring-1 ring-white/70 shadow-[0_6px_18px_-6px_rgba(15,23,42,0.18)] bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-canvas-warm)] bg-cover bg-center"
                style={{ backgroundImage: `url('${BP}/avatar.jpg')` }}
              />

              <h1 className="text-[28px] font-semibold tracking-[-0.02em] mb-4 text-[var(--color-ink)]">
                About
              </h1>

              <p className="text-[15px] leading-[1.9] text-[var(--color-ink-soft)] font-[450]">
                这里是「小城染墨」
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/55 border border-white/75 text-[12.5px] font-medium tracking-tight text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-white/80 transition-colors"
                    >
                      {l.label}
                      <span aria-hidden className="text-[10px] opacity-60">
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right (two columns poetry) */}
            <div className="grid md:grid-cols-2 gap-8 text-[15px] leading-[2] text-[var(--color-ink-soft)] font-[450] pt-2">
              
              <div className="space-y-5">
                <p>
                  感情太满，<br />
                  文字太轻，<br />
                  心里涨潮，<br />
                  纸上无声。
                </p>

                <p>
                  很多话在夜里翻涌，<br />
                  却停在光标闪烁的一瞬。<br />
                  想表达的，<br />
                  总比真正写下的更多。
                </p>

                <p>
                  想法太多，<br />
                  脚步太停，<br />
                  人困在脑海里，<br />
                  于是长出迷茫。
                </p>
              </div>

              <div className="space-y-5">
                <p>
                  总以为再准备一些，<br />
                  就能开始；<br />
                  总以为再成熟一点，<br />
                  就能坦然。
                </p>

                <p>
                  可后来才发现，<br />
                  迷茫不是没有方向，<br />
                  而是站在原地太久。
                </p>

                <p>
                  于是慢慢学会——<br />
                  先落下一笔，<br />
                  再翻过一页；<br />
                  先走出一步，<br />
                  再去回答远方。
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}