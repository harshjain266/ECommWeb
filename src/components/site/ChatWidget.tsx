"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Mail, Phone } from "lucide-react";
import { ATELIER, findAnswer, knowledgeBase } from "@/lib/chat-faq";

type Message =
  | { id: number; from: "visitor"; text: string }
  | { id: number; from: "atelier"; text: string }
  /** Nothing matched — offer the people who can actually answer. */
  | { id: number; from: "atelier"; text: string; contact: true };

const OPENING =
  "Ask about lead times, shipping, fittings, returns or anything else — I will answer what I can.";

/** A handful of the real FAQ questions, as one-tap starters. */
const STARTERS = [
  "How far ahead should I commission a bridal piece?",
  "Do you ship internationally?",
  "What does Custom Tailored actually include?",
  "How do I book an appointment?",
];

/**
 * Side chat widget.
 *
 * It answers from the FAQ and nothing else. When a question does not match,
 * it says so and hands over the atelier's email and phone rather than
 * improvising -- a boutique would rather a bridal client heard "write to us"
 * than a confident wrong answer about a lead time.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const kb = useRef(knowledgeBase());

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    setText("");

    const match = findAnswer(q, kb.current);
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, from: "visitor", text: q },
      match
        ? { id: nextId.current++, from: "atelier", text: match.answer }
        : {
            id: nextId.current++,
            from: "atelier",
            text: "That one I cannot answer properly from here. Kindly mail us and someone from the atelier will come back to you.",
            contact: true,
          },
    ]);
  }

  const asked = messages.some((m) => m.from === "visitor");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-4 z-[115] flex max-h-[min(78vh,560px)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden bg-bone shadow-2xl sm:bottom-24 sm:right-5"
            role="dialog"
            aria-label="Chat with the atelier"
          >
            <div className="shrink-0 bg-ink px-5 py-4 text-bone">
              <p className="label text-gold-light">Talk to the atelier</p>
              <p className="mt-1.5 font-display text-[19px] font-light">
                We answer personally
              </p>
              <p className="mt-1 font-sans text-[11px] text-bone/55">
                Tue–Sat, 11am — 7pm IST. Usually within the hour.
              </p>
            </div>

            <div ref={threadRef} className="flex-1 overflow-y-auto p-4">
              <p className="font-sans text-[12.5px] leading-relaxed text-ink-mute">
                {OPENING}
              </p>

              {messages.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={m.from === "visitor" ? "flex justify-end" : ""}
                    >
                      <div
                        className={
                          m.from === "visitor"
                            ? "max-w-[85%] bg-ink px-3 py-2 font-sans text-[12.5px] leading-snug text-bone"
                            : "max-w-[92%] border-l-2 border-gold bg-bone-warm px-3 py-2.5 font-sans text-[12.5px] leading-relaxed text-ink"
                        }
                      >
                        {m.text}

                        {"contact" in m && (
                          <div className="mt-3 space-y-1.5 border-t border-ink/10 pt-2.5">
                            <a
                              href={`mailto:${ATELIER.email}?subject=${encodeURIComponent("A question for the atelier")}`}
                              className="flex items-center gap-2 text-ink-mute transition-colors hover:text-oxblood"
                            >
                              <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                              {ATELIER.email}
                            </a>
                            <a
                              href={`tel:${ATELIER.phoneDigits}`}
                              className="flex items-center gap-2 text-ink-mute transition-colors hover:text-oxblood"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                              {ATELIER.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {!asked && (
                <>
                  <p className="label mt-5 text-ink-mute/60">Common questions</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {STARTERS.map((p) => (
                      <li key={p}>
                        <button
                          type="button"
                          onClick={() => ask(p)}
                          className="w-full border border-ink/12 px-3 py-2.5 text-left font-sans text-[12px] leading-snug text-ink-mute transition-colors hover:border-ink/40 hover:text-ink"
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <form
              className="shrink-0 flex items-center gap-2 border-t border-ink/10 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                ask(text);
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask a question…"
                aria-label="Ask the atelier a question"
                className="field !py-2.5 text-[13px]"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Send"
                className="btn-dark shrink-0 !px-3.5 !py-3 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with the atelier"}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-[116] flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bone shadow-xl transition-transform duration-300 hover:scale-105 sm:bottom-5 sm:right-5 sm:h-12 sm:w-12"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>
    </>
  );
}
