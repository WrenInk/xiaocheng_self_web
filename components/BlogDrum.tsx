"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PostMeta } from "@/lib/types";
import { formatDate } from "@/lib/types";

type Props = {
  posts: PostMeta[];
  bodies: Record<string, string>;
  initialSlug?: string;
};

const MATURITY_LABEL: Record<PostMeta["maturity"], string> = {
  seedling: "Seedling",
  budding: "Budding",
  evergreen: "Evergreen",
};

const MATURITY_DOT: Record<PostMeta["maturity"], string> = {
  seedling: "bg-emerald-400/80",
  budding: "bg-amber-400/80",
  evergreen: "bg-sky-400/80",
};

const SPRING = { type: "spring", stiffness: 220, damping: 32, mass: 0.9 } as const;

// Read at module scope — set at build time. Empty string locally.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Strip the basePath prefix from a full pathname so route-matching works
// the same locally (basePath="") and on GitHub Pages (basePath="/<repo>").
function stripBase(pathname: string): string {
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }
  return pathname;
}

function withBase(path: string): string {
  return BASE_PATH ? `${BASE_PATH}${path}` : path;
}

export function BlogDrum({ posts, bodies, initialSlug }: Props) {
  const reduce = useReducedMotion();

  const initialIndex = useMemo(() => {
    if (!initialSlug) return 0;
    const i = posts.findIndex((p) => p.slug === initialSlug);
    return i === -1 ? 0 : i;
  }, [posts, initialSlug]);

  const [active, setActive] = useState(initialIndex);
  const [opened, setOpened] = useState<string | null>(initialSlug ?? null);
  // True from the moment a panel starts closing until its layoutId morph
  // and exit animations are fully done. While this is true, the drum is
  // frozen — scrolling now would interrupt the in-flight FLIP and strand
  // the source card's title at a half-way position.
  const [closing, setClosing] = useState(false);
  const wheelAcc = useRef(0);
  const lastStepAt = useRef(0);
  const lastWheelAt = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const drumRef = useRef<HTMLDivElement>(null);

  const N = posts.length;

  // Index loops: last -> first -> last.
  const wrap = useCallback(
    (i: number) => ((i % N) + N) % N,
    [N]
  );

  const step = useCallback(
    (delta: number) => setActive((prev) => wrap(prev + delta)),
    [wrap]
  );

  const openCard = useCallback(
    (slug: string) => {
      if (closing) return;
      setOpened(slug);
      window.history.pushState({ slug }, "", withBase(`/blog/${slug}/`));
      const title = posts.find((p) => p.slug === slug)?.title;
      if (title) document.title = `${title} — Notes`;
    },
    [posts, closing]
  );

  const closeCard = useCallback(() => {
    setClosing(true);
    setOpened(null);
    window.history.pushState({}, "", withBase(`/blog/`));
    document.title = `Blog — Notes & Garden`;
  }, []);

  useEffect(() => {
    const onPop = () => {
      const path = stripBase(window.location.pathname);
      const m = path.match(/^\/blog\/([^/?#]+)/);
      if (m) {
        const slug = decodeURIComponent(m[1]);
        if (posts.some((p) => p.slug === slug)) {
          setOpened(slug);
          setActive(posts.findIndex((p) => p.slug === slug));
          return;
        }
      }
      setOpened(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [posts]);

  // Delta accumulator: scrolling continuously keeps advancing cards.
  // - One mouse-wheel tick (~100-120px deltaY) = roughly one step.
  // - A sustained trackpad scroll accumulates many small deltas and
  //   keeps stepping for as long as the user keeps scrolling.
  // - Min interval throttles spring animation so it has time to land.
  useEffect(() => {
    if (opened || closing) return;
    const el = drumRef.current;
    if (!el) return;
    const STEP = 80;     // px of wheel delta per card
    const MIN_MS = 110;  // min interval between steps
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const now = performance.now();
      // Reset accumulator if there was a pause — prevents stale buildup.
      if (now - lastWheelAt.current > 220) wheelAcc.current = 0;
      lastWheelAt.current = now;
      wheelAcc.current += e.deltaY;
      if (
        Math.abs(wheelAcc.current) >= STEP &&
        now - lastStepAt.current >= MIN_MS
      ) {
        step(wheelAcc.current > 0 ? 1 : -1);
        wheelAcc.current = 0;
        lastStepAt.current = now;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step, opened, closing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (opened) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeCard();
        }
        return;
      }
      if (closing) return; // freeze input during reverse morph
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const slug = posts[active]?.slug;
        if (slug) openCard(slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, opened, closing, step, posts, openCard, closeCard]);

  useLayoutEffect(() => {
    if (!opened) {
      document.body.classList.add("no-scroll");
      return () => document.body.classList.remove("no-scroll");
    }
  }, [opened]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (opened || closing) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (opened || closing || touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const drum = useMemo(() => {
    const stepAngleDeg = 24;
    const radius = 560;
    const half = N / 2;
    return posts.map((p, i) => {
      // Shortest cyclic signed distance so the drum truly loops.
      let offset = i - active;
      if (offset > half) offset -= N;
      else if (offset < -half) offset += N;
      const angle = offset * stepAngleDeg;
      const rad = (angle * Math.PI) / 180;
      const tx = Math.sin(rad) * radius;
      const tz = Math.cos(rad) * radius - radius;
      const abs = Math.abs(offset);
      const scale = abs === 0 ? 1 : Math.max(0.66, 1 - abs * 0.11);
      const opacity =
        abs === 0 ? 1 : Math.max(0, 1 - abs * 0.32);
      const visible = abs <= 3;
      return { post: p, i, offset, angle, tx, tz, scale, opacity, visible };
    });
  }, [posts, active, N]);

  const openedPost = opened ? posts.find((p) => p.slug === opened) ?? null : null;

  return (
    <div
      ref={drumRef}
      className="fixed inset-0 z-10 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ perspective: 1400 }}
    >
      {/* Drum stage. On close, reveal is delayed so the panel has time to
          morph back and fade out — avoids ghost overlap of post text + drum. */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pt-20 pb-32"
        animate={{ opacity: opened ? 0 : 1 }}
        transition={{
          duration: opened ? 0.2 : 0.45,
          ease: [0.22, 1, 0.36, 1],
          delay: opened ? 0 : 0.32,
        }}
        style={{ pointerEvents: opened ? "none" : "auto" }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {drum.map(({ post, i, offset, angle, tx, tz, scale, opacity, visible }) => {
            if (!visible) return null;
            const focused = offset === 0;
            const isSource = opened === post.slug;
            return (
              <motion.div
                key={post.slug}
                role="button"
                tabIndex={focused ? 0 : -1}
                aria-label={focused ? `Open ${post.title}` : `Go to ${post.title}`}
                onClick={() => {
                  if (opened || closing) return;
                  if (focused) openCard(post.slug);
                  else setActive(i);
                }}
                className="absolute outline-none"
                initial={false}
                animate={
                  reduce
                    ? {
                        x: offset * 80,
                        opacity: opened ? 0 : focused ? 1 : 0.35,
                        scale: 1,
                      }
                    : {
                        x: tx,
                        z: tz,
                        rotateY: -angle,
                        scale,
                        opacity: isSource ? 0 : opacity,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 30,
                  mass: 0.8,
                }}
                style={{
                  transformStyle: "preserve-3d",
                  cursor: focused && !opened ? "pointer" : "default",
                  zIndex: 100 - Math.abs(offset),
                  willChange: focused ? "transform" : undefined,
                }}
              >
                <DrumCard post={post} focused={focused} hidden={isSource} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Expanded panel */}
      <AnimatePresence onExitComplete={() => setClosing(false)}>
        {openedPost && (
          <ExpandedPanel
            key={`expanded-${openedPost.slug}`}
            post={openedPost}
            body={bodies[openedPost.slug]}
            onClose={closeCard}
          />
        )}
      </AnimatePresence>

      {/* Timeline rail */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 px-6 sm:px-10"
        animate={{ opacity: opened ? 0 : 1, y: opened ? 12 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: opened ? "none" : "auto" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="glass glass-inner-glow rounded-2xl px-3 py-3 relative overflow-hidden">
            <span className="glass-gloss rounded-2xl" />
            <div className="relative z-10 flex items-stretch gap-1 overflow-x-auto no-scrollbar">
              {posts.map((p, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={p.slug}
                    onClick={() => {
                      if (closing) return;
                      setActive(i);
                    }}
                    className="group relative flex-1 min-w-[72px] text-left px-2.5 py-1.5 rounded-lg transition-colors"
                    aria-label={`Go to ${p.title}`}
                    aria-current={isActive}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`w-1 h-1 rounded-full ${MATURITY_DOT[p.maturity]}`} />
                      <span
                        className={[
                          "text-[10px] tabular-nums tracking-wide",
                          isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]",
                        ].join(" ")}
                      >
                        {formatDate(p.date)}
                      </span>
                    </div>
                    <div
                      className={[
                        "text-[11px] leading-tight tracking-tight truncate transition-colors",
                        isActive
                          ? "text-[var(--color-ink)] font-medium"
                          : "text-[var(--color-ink-soft)] group-hover:text-[var(--color-ink)]",
                      ].join(" ")}
                    >
                      {p.title}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="timeline-cursor"
                        className="absolute inset-0 rounded-lg border border-[var(--color-ink)]/15 bg-white/30"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[var(--color-ink-muted)] tracking-wide">
            <kbd className="px-1.5 py-0.5 rounded bg-white/60 border border-[var(--color-rule)] text-[10px]">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/60 border border-[var(--color-rule)] text-[10px]">→</kbd>
            <span>or scroll</span>
            <span className="opacity-40">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/60 border border-[var(--color-rule)] text-[10px]">Enter</kbd>
            <span>to open</span>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ============================================================ */

function DrumCard({
  post,
  focused,
  hidden,
}: {
  post: PostMeta;
  focused: boolean;
  hidden: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!focused || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    cardRef.current.style.setProperty("--gloss-x", `${x}%`);
    cardRef.current.style.setProperty("--gloss-y", `${y}%`);
  };
  const onLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--gloss-x", `20%`);
    cardRef.current.style.setProperty("--gloss-y", `12%`);
  };

  // Only the focused card gets the full glass treatment (backdrop-filter is expensive).
  // Side cards use the lighter glass-quiet variant.
  const shell = focused ? "glass glass-inner-glow" : "glass-quiet";
  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...(hidden ? {} : { layoutId: `card-${post.slug}` })}
      className={`${shell} relative w-[320px] sm:w-[380px] h-[440px] rounded-[28px] overflow-hidden`}
      style={{
        visibility: hidden ? "hidden" : "visible",
      }}
      transition={SPRING}
    >
      {focused && <span className="glass-gloss rounded-[28px]" />}
      {focused && <span className="glass-live-gloss rounded-[28px]" />}

      <div className="relative z-10 flex flex-col h-full p-7">
        <div className="flex items-center justify-between mb-6">
          <motion.span
            {...(hidden ? {} : { layoutId: `date-${post.slug}` })}
            className="text-[11px] uppercase tracking-[0.16em] font-medium text-[var(--color-ink-muted)] tabular-nums whitespace-nowrap"
            transition={SPRING}
          >
            {formatDate(post.date)}
          </motion.span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            <span className={`w-1.5 h-1.5 rounded-full ${MATURITY_DOT[post.maturity]}`} />
            {MATURITY_LABEL[post.maturity]}
          </span>
        </div>

        <motion.h2
          {...(hidden ? {} : { layoutId: `title-${post.slug}` })}
          className="text-[24px] sm:text-[27px] leading-[1.15] font-semibold tracking-[-0.02em] text-[var(--color-ink)]"
          transition={SPRING}
        >
          {post.title}
        </motion.h2>

        <p className="mt-4 text-[14px] leading-[1.6] text-[var(--color-ink-soft)] line-clamp-4 font-[450]">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-white/50 border border-white/60 text-[10.5px] tracking-tight text-[var(--color-ink-soft)]"
              >
                {t}
              </span>
            ))}
          </div>
          {focused && (
            <span className="text-[12px] text-[var(--color-ink-muted)] tracking-tight flex items-center gap-1">
              Read
              <span aria-hidden>→</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */

function ExpandedPanel({
  post,
  body,
  onClose,
}: {
  post: PostMeta;
  body: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-30"
      initial={{ backgroundColor: "rgba(244, 239, 227, 0)" }}
      animate={{ backgroundColor: "rgba(244, 239, 227, 0.55)" }}
      exit={{ backgroundColor: "rgba(244, 239, 227, 0)" }}
      transition={{ duration: 0.35 }}
    >
      {/* Layer 1: the glass card morphing from drum card to fullscreen.
          NOT a scroll container — that lives outside, so layout animation
          doesn't interfere with the wheel. */}
      <motion.div
        layoutId={`card-${post.slug}`}
        className="glass glass-inner-glow absolute inset-x-4 sm:inset-x-10 top-20 bottom-6 rounded-[28px] overflow-hidden pointer-events-none"
        transition={SPRING}
      >
        <span className="glass-gloss rounded-[28px]" />
      </motion.div>

      {/* Layer 2: the actual content. Sibling of the glass layer so its
          scroll container isn't inside an animating transform. Wrapped in
          a motion.div so it has its own exit fade — without this, the
          text would still be sitting fully-opaque after the glass starts
          morphing back into the drum card, causing the drum-cards-behind
          ghost overlap. */}
      <motion.div
        className="absolute inset-x-4 sm:inset-x-10 top-20 bottom-6 rounded-[28px] overflow-hidden pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
          // Wait until the glass morph is most of the way there.
          delay: 0.18,
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div
          className="h-full w-full overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="max-w-2xl mx-auto px-8 sm:px-12 pt-14 sm:pt-20 pb-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="flex items-center flex-wrap gap-3 mb-4"
            >
              <motion.span
                layoutId={`date-${post.slug}`}
                className="text-[11px] uppercase tracking-[0.16em] font-medium text-[var(--color-ink-muted)] tabular-nums whitespace-nowrap"
                transition={SPRING}
              >
                {formatDate(post.date)}
              </motion.span>
              <span className="text-[var(--color-ink-muted)] opacity-50">·</span>
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                <span className={`w-1.5 h-1.5 rounded-full ${MATURITY_DOT[post.maturity]}`} />
                {MATURITY_LABEL[post.maturity]}
              </span>
              <span className="text-[var(--color-ink-muted)] opacity-50">·</span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10.5px] tracking-tight text-[var(--color-ink-soft)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.h1
              layoutId={`title-${post.slug}`}
              className="text-[34px] sm:text-[40px] leading-[1.1] font-semibold tracking-[-0.025em] text-[var(--color-ink)] mb-10"
              transition={SPRING}
            >
              {post.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: body }}
            />


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35 }}
              className="mt-16 pt-8 border-t border-[var(--color-rule)]"
            >
              <button
                onClick={onClose}
                className="text-[13px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-2 tracking-tight"
              >
                <span aria-hidden>←</span>
                Back to garden
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/60 border border-[var(--color-rule)] text-[10px] tracking-wide">
                  Esc
                </kbd>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Close X — top layer */}
      <motion.button
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.3 }}
        aria-label="Close"
        className="absolute top-24 right-7 sm:right-14 z-40 w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-white/90 transition-colors shadow-sm"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.button>
    </motion.div>
  );
}
