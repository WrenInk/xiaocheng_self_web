"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/* Next.js App Router's template.tsx remounts on every navigation
   (unlike layout.tsx which persists), so a Framer Motion enter
   animation hung off it produces a soft cross-fade between pages.

   We deliberately animate opacity ONLY. `transform` and `filter`
   on a parent create a new containing block for `position: fixed`
   children, which would break BlogDrum (it relies on `fixed inset-0`
   to anchor the drum to the viewport). Opacity has no such effect. */

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
