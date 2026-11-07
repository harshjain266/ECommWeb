"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A card that tilts in 3D towards the pointer, with a specular sheen that
 * tracks it.
 *
 * Jewellery photographs are flat renderings of objects whose whole appeal is
 * that they catch the light as you turn them. Tilting the card and sliding a
 * highlight across it gives back a little of that — the piece appears to be
 * held rather than printed.
 *
 * Pointer-driven rather than animated: nothing moves until the visitor moves,
 * so a grid of thirty of these costs nothing while it is being scrolled past.
 * Transforms are written straight to the node's style, which keeps the work
 * off React's render path entirely.
 */
export function TiltCard({
  children,
  className,
  /** Degrees of rotation at the far corner. */
  max = 9,
  /** How far the card lifts towards the viewer on hover, in px. */
  lift = 14,
  sheen = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  sheen?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, on: false });

  if (reduce) return <div className={className}>{children}</div>;

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    const card = inner.current;
    if (!el || !card) return;
    const r = el.getBoundingClientRect();
    // -0.5 … 0.5 from the centre of the card, on both axes.
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${-py * 2 * max}deg) rotateY(${
      px * 2 * max
    }deg) translateZ(${lift}px)`;
    setGlare({ x: (px + 0.5) * 100, y: (py + 0.5) * 100, on: true });
  }

  function leave() {
    const card = inner.current;
    if (card) card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    setGlare((g) => ({ ...g, on: false }));
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("[perspective:1100px]", className)}
    >
      <div
        ref={inner}
        className="relative h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] will-change-transform"
      >
        {children}
        {sheen && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
            style={{
              opacity: glare.on ? 1 : 0,
              background: `radial-gradient(420px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.28), rgba(255,255,255,0.06) 38%, transparent 62%)`,
              mixBlendMode: "soft-light",
            }}
          />
        )}
      </div>
    </div>
  );
}
