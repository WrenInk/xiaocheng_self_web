"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ============================================================
   Claude Pet — a small sparkle creature that lives in the corner.
   - Bobs gently when idle.
   - Eyes track the cursor.
   - Click for a random encouragement (context-aware per route).
   - Drag to reposition; position is saved to localStorage.
   - Dismissible (X on hover); state is saved too.
   - Respects prefers-reduced-motion.
   ============================================================ */

const STORAGE_KEY = "claude-pet:v2";

const LINES_BY_ROUTE: Record<string, string[]> = {
  "/": [
    "Welcome in.",
    "Make yourself at home.",
    "Tea? Pixels? Both?",
    "Take a look around.",
  ],
  "/blog": [
    "Pick a note. Or just scroll.",
    "Try the wheel — one tick per card.",
    "Press Enter to open this one.",
    "Evergreens age well. Seedlings need light.",
    "← → also works, if that's your thing.",
  ],
  "/about": [
    "All this from one person.",
    "Patient gardener.",
  ],
  default: [
    "Hi there.",
    "Curious mind, welcome.",
    "Read like nobody's watching.",
    "Take your time.",
  ],
};

type Stored = {
  dismissed?: boolean;
  x?: number;
  y?: number;
};

export function ClaudePet() {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  // Avoid SSR hydration mismatch — render nothing until we read localStorage.
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [bounds, setBounds] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const bubbleTimer = useRef<number | null>(null);

  const petRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Drag bounds — pet must stay at least HALF visible. Recompute on resize.
  useEffect(() => {
    const PET = 80;
    const KEEP = PET / 2; // require at least half the pet stays on-screen
    const DEFAULT_INSET = 28; // matches CSS bottom-7 right-7 (~1.75rem)
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Default position: bottom-right inset by DEFAULT_INSET.
      // Pet left = w - DEFAULT_INSET - PET; allow it to slide left so half stays visible.
      setBounds({
        left: -(w - DEFAULT_INSET - KEEP),
        right: DEFAULT_INSET + KEEP,
        top: -(h - DEFAULT_INSET - KEEP),
        bottom: DEFAULT_INSET + KEEP,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const eyeX = useSpring(0, { stiffness: 280, damping: 22, mass: 0.5 });
  const eyeY = useSpring(0, { stiffness: 280, damping: 22, mass: 0.5 });

  const lines = useMemo(() => {
    if (pathname?.startsWith("/blog")) return LINES_BY_ROUTE["/blog"];
    if (pathname === "/about") return LINES_BY_ROUTE["/about"];
    if (pathname === "/") return LINES_BY_ROUTE["/"];
    return LINES_BY_ROUTE.default;
  }, [pathname]);

  // Hydrate from localStorage. Clamp position so a previously-offscreen
  // drop doesn't strand the pet outside the viewport on this device.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const KEEP = 40;
        const INSET = 28;
        const minX = -(w - INSET - KEEP);
        const maxX = INSET + KEEP;
        const minY = -(h - INSET - KEEP);
        const maxY = INSET + KEEP;
        const sx = typeof s.x === "number" ? s.x : 0;
        const sy = typeof s.y === "number" ? s.y : 0;
        x.set(Math.max(minX, Math.min(maxX, sx)));
        y.set(Math.max(minY, Math.min(maxY, sy)));
        if (s.dismissed) setDismissed(true);
      }
    } catch {
      // ignore quota / parse errors
    }
    setHydrated(true);
  }, [x, y]);

  // Persist on changes.
  useEffect(() => {
    if (!hydrated) return;
    const save = () => {
      try {
        const s: Stored = { dismissed, x: x.get(), y: y.get() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {
        // ignore
      }
    };
    save();
    const u1 = x.on("change", save);
    const u2 = y.on("change", save);
    return () => {
      u1();
      u2();
    };
  }, [hydrated, dismissed, x, y]);

  // Eye-tracking: pull eye position toward the cursor.
  useEffect(() => {
    if (reduce || dismissed) return;
    let raf = 0;
    let cursorX = 0;
    let cursorY = 0;
    const tick = () => {
      const el = petRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cursorX - cx;
        const dy = cursorY - cy;
        const d = Math.hypot(dx, dy) || 1;
        const MAX = 2.6; // in viewBox units (SVG is 100×100)
        eyeX.set((dx / d) * MAX);
        eyeY.set((dy / d) * MAX);
      }
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [eyeX, eyeY, reduce, dismissed]);

  // Greet once per session on first hydrate.
  useEffect(() => {
    if (!hydrated || dismissed) return;
    const greeted = sessionStorage.getItem("claude-pet:greeted");
    if (greeted) return;
    sessionStorage.setItem("claude-pet:greeted", "1");
    const t = window.setTimeout(() => speak(lines[0]), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, dismissed]);

  const speak = (msg: string) => {
    setBubble(msg);
    if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 3400);
  };

  const onPetClick = () => {
    speak(lines[Math.floor(Math.random() * lines.length)]);
  };

  if (!hydrated) return null;

  // When dismissed: show a small "summon" pill in the corner instead of nothing.
  if (dismissed) {
    return (
      <motion.button
        type="button"
        onClick={() => {
          setDismissed(false);
          // Reset position so the pet reappears at its default corner.
          x.set(0);
          y.set(0);
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.85, scale: 1 }}
        whileHover={{ opacity: 1, scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="fixed bottom-5 right-5 z-50 w-9 h-9 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-deep)] transition-colors flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(184,89,60,0.5)]"
        aria-label="Bring the pet back"
        title="Bring the pet back"
      >
        {/* Miniature pet silhouette — tiny chunky alien outline */}
        <svg
          width="18"
          height="14"
          viewBox="0 0 12 8"
          shapeRendering="crispEdges"
          aria-hidden
        >
          {[
            "..XXXXXXXX..",
            "..X.XXXX.X..",
            "XXXXXXXXXXXX",
            "XXXXXXXXXXXX",
            "..XXXXXXXX..",
            "..XXXXXXXX..",
            "..X.X..X.X..",
            "..X.X..X.X..",
          ].flatMap((row, y) =>
            row
              .split("")
              .map((c, x) =>
                c === "X" ? (
                  <rect
                    key={`m-${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill="#ffffff"
                  />
                ) : null
              )
          )}
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={petRef}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={bounds}
      style={{ x, y }}
      className="fixed bottom-7 right-7 z-50 select-none touch-none"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label="Claude pet — click to chat"
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="absolute bottom-full right-0 mb-3 whitespace-nowrap"
          >
            <div className="relative glass glass-inner-glow rounded-2xl px-3.5 py-2 text-[12.5px] font-medium tracking-tight text-[var(--color-ink)]">
              <span className="glass-gloss rounded-2xl" />
              <span className="relative z-10">{bubble}</span>
            </div>
            <div className="absolute -bottom-1 right-7 w-2.5 h-2.5 rotate-45 bg-white/80 border-r border-b border-white/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss button — only on hover */}
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          scale: hovered ? 1 : 0.85,
        }}
        transition={{ duration: 0.15 }}
        aria-label="Dismiss"
        className="absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-white/95 border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-white shadow-sm"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
          <path
            d="M1 1 L7 7 M7 1 L1 7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </motion.button>

      {/* The pet itself */}
      <motion.button
        type="button"
        onClick={onPetClick}
        className="block cursor-grab active:cursor-grabbing"
        animate={reduce ? {} : { y: [0, -3, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.08, rotate: -3 }}
        whileTap={{ scale: 0.92 }}
      >
        <PetPixel eyeX={eyeX} eyeY={eyeY} />
      </motion.button>
    </motion.div>
  );
}

/* ============================================================ */

/* ---- Pixel-art chunky-alien mascot ---- */

// 12×8 sprite, centered in a 12×12 canvas (2 rows of padding above + below).
// Eyes (row 1) overlay the sprite as separate motion rects so they can
// shift 1px in each direction to follow the cursor. Body rows have varying
// widths — 8px head, 12px shoulders, 8px lower body, then 4 thin legs.
const SPRITE: ReadonlyArray<string> = [
  "..XXXXXXXX..", // 0 head top
  "..XXXXXXXX..", // 1 eye row (orange — eyes drawn on top)
  "XXXXXXXXXXXX", // 2 shoulders
  "XXXXXXXXXXXX", // 3
  "..XXXXXXXX..", // 4 lower body
  "..XXXXXXXX..", // 5
  "..X.X..X.X..", // 6 legs (4 thin)
  "..X.X..X.X..", // 7
];

const SPRITE_TOP = 2; // y-offset when drawn inside a 12×12 viewBox

function PetPixel({
  eyeX,
  eyeY,
}: {
  eyeX: MotionValue<number>;
  eyeY: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);

  // Random blink loop — 2.8–6.3s gap, 130ms closed.
  useEffect(() => {
    if (reduce) return;
    let alive = true;
    let timer = 0;
    const loop = () => {
      const wait = 2800 + Math.random() * 3500;
      timer = window.setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        timer = window.setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          loop();
        }, 130);
      }, wait);
    };
    loop();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [reduce]);

  // 1×1 eyes — snap to one of 3 positions on each axis (-1, 0, +1)
  // with a deadzone so they don't jitter on a still cursor.
  const shiftX = useTransform(eyeX, (v) => (v > 0.8 ? 1 : v < -0.8 ? -1 : 0));
  const shiftY = useTransform(eyeY, (v) => (v > 0.8 ? 1 : v < -0.8 ? -1 : 0));

  // Base positions for the two eyes (within the sprite frame).
  const lex = useTransform(shiftX, (v) => 3 + v);
  const ley = useTransform(shiftY, (v) => 1 + v + SPRITE_TOP);
  const rex = useTransform(shiftX, (v) => 8 + v);
  const rey = useTransform(shiftY, (v) => 1 + v + SPRITE_TOP);

  const ORANGE = "#d97757";
  const DARK = "#1f1d1a";

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 6px 12px rgba(184,89,60,0.32)) drop-shadow(0 2px 3px rgba(184,89,60,0.2))",
      }}
    >
      <g transform={`translate(0, ${SPRITE_TOP})`}>
        {SPRITE.flatMap((row, y) =>
          row.split("").map((c, x) =>
            c === "X" ? (
              <rect
                key={`b-${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={ORANGE}
              />
            ) : null
          )
        )}
      </g>

      {/* Eyes — hidden during blink to fake a single-frame eye-close. */}
      {!blink && (
        <>
          <motion.rect x={lex} y={ley} width={1} height={1} fill={DARK} />
          <motion.rect x={rex} y={rey} width={1} height={1} fill={DARK} />
        </>
      )}
    </svg>
  );
}
