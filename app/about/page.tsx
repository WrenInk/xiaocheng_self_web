import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "关于 — Notes & Garden",
};

const links = [
  { label: "GitHub", href: "https://github.com/WrenInk" },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex items-center px-6 sm:px-10 pt-24 pb-16">
      <div className="max-w-xl mx-auto w-full">
        <div className="glass glass-inner-glow rounded-[28px] p-10 relative overflow-hidden">
          <span className="glass-gloss rounded-[28px]" />
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-6 ring-1 ring-white/70 shadow-[0_6px_18px_-6px_rgba(15,23,42,0.18)] bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-canvas-warm)]">
              <Image
                src="/avatar.jpg"
                alt="小城染墨"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] mb-4 text-[var(--color-ink)]">
              关于
            </h1>
            <div className="space-y-3 text-[15px] leading-[1.85] text-[var(--color-ink-soft)] font-[450]">
              <p>
                这里是「小城染墨」——写字慢，想得多。
              </p>
              <p>
                这个数字花园是我放下学习痕迹的地方。
                有些文字是刚冒头的种子（seedling），
                有些是反复修剪过的常青（evergreen），
                都还没"完成"——花园本来就不存在完成。
              </p>
              <p>
                顶部的 Blog 进去是一个 3D 滚筒。
                鼠标滚轮一次翻一篇，从头滚到尾再滚回开头。
                喜欢慢的人随便看。
              </p>
            </div>
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
                    <span aria-hidden className="text-[10px] opacity-60">↗</span>
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
