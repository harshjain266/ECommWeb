"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

const WHATSAPP = "919870196806";

const PROMPTS = [
  "What are your bridal lead times?",
  "Can you ship to the UK?",
  "Do you do custom tailoring?",
  "I'd like to book an appointment.",
];

/**
 * Side chat widget. Messages hand off to WhatsApp rather than pretending to
 * be a live agent — a boutique this size answers personally, and a fake bot
 * would be worse than no bot.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const send = (message: string) => {
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    setText("");
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-[115] w-[min(340px,calc(100vw-2.5rem))] overflow-hidden bg-bone shadow-2xl"
          >
            <div className="bg-ink px-5 py-4 text-bone">
              <p className="label text-gold-light">Talk to the atelier</p>
              <p className="mt-1.5 font-display text-[19px] font-light">
                We answer personally
              </p>
              <p className="mt-1 font-sans text-[11px] text-bone/55">
                Tue–Sat, 11am — 7pm IST. Usually within the hour.
              </p>
            </div>

            <div className="p-4">
              <p className="label text-ink-mute/60">Common questions</p>
              <ul className="mt-2.5 space-y-1.5">
                {PROMPTS.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => send(p)}
                      className="w-full border border-ink/12 px-3 py-2.5 text-left font-sans text-[12px] leading-snug text-ink-mute transition-colors hover:border-ink/40 hover:text-ink"
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>

              <form
                className="mt-4 flex items-center gap-2 border-t border-ink/10 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) send(text.trim());
                }}
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message…"
                  aria-label="Message the atelier"
                  className="field !py-2.5 text-[13px]"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  aria-label="Send on WhatsApp"
                  className="btn-dark shrink-0 !px-3.5 !py-3 disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with the atelier"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[116] flex h-12 w-12 items-center justify-center rounded-full bg-ink text-bone shadow-xl transition-transform duration-300 hover:scale-105"
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
