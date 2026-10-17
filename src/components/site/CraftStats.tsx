"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 11, suffix: "", label: "Years in the atelier" },
  { value: 38, suffix: "", label: "Karigars on the floor" },
  { value: 900, suffix: "+", label: "Hours in a bridal piece" },
  { value: 3, suffix: "", label: "Fittings, always included" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1700;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      // ease-out cubic, so the number settles rather than stopping dead
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export function CraftStats() {
  return (
    <section className="border-y border-ink/10 bg-bone py-16 lg:py-20">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="display text-[clamp(2.8rem,7vw,4.4rem)] text-ink">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="label mt-2 text-ink-mute/70">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
