"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered fade-and-rise. Collapses to a plain div when the visitor
 * has asked for reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: {
  children: ReactNode;
  /** Seconds of delay, for staggering siblings. */
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Splits a line into words and rises each from behind a clipping mask, in
 * sequence. Used for display headings, where the per-word stagger reads as
 * typesetting rather than as an animation.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  /*
   * The scroll trigger sits on the unclipped wrapper, not on each word.
   *
   * It used to live on the word itself, which deadlocked: the word starts
   * translated 110% down, its parent masks overflow, so the word was clipped
   * entirely out of the viewport -- and IntersectionObserver reports a fully
   * clipped element as not intersecting. The reveal therefore never fired and
   * the heading stayed invisible permanently, scrolling included. Observing
   * the wrapper (which is never clipped) and driving the words through
   * variants breaks the cycle.
   */
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {/*
        The separating space is a text node *between* the word masks, not the
        last character inside one. Inside an inline-block, trailing whitespace
        is collapsed away by the browser, so keeping it there ran every
        heading together -- "Whereindividualitymeetscontemporary".
      */}
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: "110%" }, shown: { y: 0 } }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}

/** Staggers whatever children are placed inside it. Pair with `RevealItem`. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-70px" }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        shown: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
