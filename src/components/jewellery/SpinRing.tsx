"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { imageUrl } from "@/lib/media";
import type { Piece } from "@/lib/jewellery";

/**
 * A carousel of pieces standing on a real 3D cylinder, turning on its own.
 *
 * Every card is placed with `rotateY(i·θ) translateZ(R)`, so the ring is
 * genuine perspective geometry rather than a row of scaled thumbnails: the
 * cards nearest the viewer are larger because they are nearer, and the ones
 * that have turned past the edge hide themselves through
 * `backface-visibility`, which is what stops the far side of the ring
 * showing through the near side.
 *
 * The rotation is written straight onto the node inside a rAF loop and never
 * through React state, so a continuously turning ring costs one style write
 * per frame and no re-renders. The caption is the single exception, and it
 * only sets state when the piece at the front actually changes.
 */
export function SpinRing({ pieces }: { pieces: Piece[] }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  const angle = useRef(0);
  /** Degrees per frame while idling. Negative turns the front leftwards. */
  const drift = useRef(-0.09);
  const paused = useRef(false);
  const drag = useRef<{ id: number; x: number; v: number } | null>(null);

  const [front, setFront] = useState(0);
  const [radius, setRadius] = useState(420);
  const [cardW, setCardW] = useState(220);

  const step = 360 / pieces.length;

  // Card size follows the viewport; the radius then follows from the card
  // width, because a ring whose cards overlap reads as a mess.
  useEffect(() => {
    const fit = () => {
      const w = Math.min(window.innerWidth, 1480);
      const card = Math.max(156, Math.min(290, w * 0.215));
      setCardW(card);
      // Half the card's footprint over tan(half the angular pitch): the
      // spacing at which neighbouring cards just touch.
      setRadius((card * 0.62) / Math.tan(Math.PI / pieces.length));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [pieces.length]);

  const apply = useCallback(() => {
    const el = ring.current;
    if (el) el.style.transform = `translateZ(${-radius}px) rotateY(${angle.current}deg)`;
  }, [radius]);

  // The turn itself.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let visible = true;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0.05,
    });
    if (stage.current) io.observe(stage.current);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      if (drag.current) {
        // Held: the pointer is driving, nothing to integrate here.
      } else if (Math.abs(drift.current) > 0.095) {
        // Flung: bleed the throw off until it settles back to the idle drift.
        drift.current *= 0.94;
        angle.current += drift.current;
      } else if (!paused.current) {
        drift.current = Math.sign(drift.current || -1) * 0.09;
        angle.current += drift.current;
      }

      apply();

      // Which piece is facing the viewer. Only published when it changes.
      const idx =
        (Math.round(-angle.current / step) % pieces.length + pieces.length) %
        pieces.length;
      setFront((f) => (f === idx ? f : idx));
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce, apply, step, pieces.length]);

  useEffect(apply, [apply]);

  function onDown(e: React.PointerEvent) {
    if (reduce) return;
    drag.current = { id: e.pointerId, x: e.clientX, v: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    d.v = dx * 0.32;
    angle.current += d.v;
    apply();
  }
  function onUp(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // Carry the throw: a flick keeps spinning and decays back to the drift.
    drift.current = Math.abs(d.v) > 0.3 ? d.v : drift.current;
    drag.current = null;
  }

  function nudge(by: number) {
    angle.current -= by * step;
    drift.current = Math.sign(-by) * 0.09;
    apply();
  }

  // Reduced motion gets the same pieces as a plain, honest grid.
  if (reduce) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {pieces.map((p) => (
          <figure key={p.id}>
            <img
              src={imageUrl(p.publicId, { width: 480 })}
              alt={p.alt}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
            <figcaption className="mt-2 font-sans text-[12px] text-bone/60">
              {p.title}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        className="relative mx-auto h-[clamp(320px,44vw,480px)] w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ perspective: `${Math.max(900, radius * 2.4)}px` }}
        role="group"
        aria-roledescription="3D carousel"
        aria-label="Pieces from the bench"
      >
        <div
          ref={ring}
          className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]"
        >
          {pieces.map((p, i) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                width: cardW,
                height: cardW * 1.25,
                marginLeft: -cardW / 2,
                marginTop: (-cardW * 1.25) / 2,
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                // The far side of the ring has turned away from us; hiding it
                // is what keeps the near cards reading as solid objects.
                backfaceVisibility: "hidden",
              }}
            >
              <img
                src={imageUrl(p.publicId, { width: 520 })}
                alt={i === front ? p.alt : ""}
                aria-hidden={i !== front}
                draggable={false}
                loading={i < 6 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full rounded-xl object-cover shadow-[0_26px_60px_-18px_rgba(0,0,0,0.95)] ring-1 ring-bone/10"
              />
              {/* Floor reflection. Cheap, and it is what sells the ring as a
                  thing standing on a surface rather than a cut-out. */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-full h-20 origin-top scale-y-[-1] overflow-hidden rounded-b-xl opacity-25 [mask-image:linear-gradient(to_top,transparent,black)]"
              >
                <img
                  src={imageUrl(p.publicId, { width: 320 })}
                  alt=""
                  draggable={false}
                  className="h-[200px] w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Edges fade into the page so the ring has no hard cut-off. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0807] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0807] to-transparent"
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <Arrow label="Turn the ring back" onClick={() => nudge(-1)} flip />
        <p
          className="min-w-[190px] text-center font-display text-[17px] font-light text-bone/75"
          aria-live="polite"
        >
          {pieces[front]?.title}
        </p>
        <Arrow label="Turn the ring on" onClick={() => nudge(1)} />
      </div>

      <p className="mt-3 text-center font-sans text-[12px] text-bone/35">
        Drag the ring to spin it.
      </p>
    </div>
  );
}

function Arrow({
  label,
  onClick,
  flip = false,
}: {
  label: string;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full border border-bone/15 p-2.5 text-bone/60 transition-colors hover:border-gold/60 hover:text-bone"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
