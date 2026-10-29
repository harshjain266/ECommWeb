import { CONTENT } from "@/lib/content";
import { ATELIER, ATELIER_ADDRESS } from "@/lib/atelier";

/**
 * The answers the chat widget can give, and the matching that picks one.
 *
 * The question/answer pairs are derived from the FAQ page rather than written
 * out again here. Two copies of the same answer drift apart the first time
 * someone edits one of them, and the version a visitor is told in chat is the
 * one they will hold us to.
 */

export type ChatAnswer = {
  question: string;
  answer: string;
  /** Extra words a visitor might use that the question itself does not. */
  also?: string[];
};

export { ATELIER };

/** Pull "h" followed by "p" out of the FAQ page as question/answer pairs. */
function fromFaqPage(): ChatAnswer[] {
  const blocks = CONTENT.faqs?.blocks ?? [];
  const pairs: ChatAnswer[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const q = blocks[i];
    const a = blocks[i + 1];
    if (q.kind === "h" && a.kind === "p") {
      pairs.push({ question: q.text, answer: a.text });
    }
  }
  return pairs;
}

/**
 * Things visitors ask that the FAQ page does not cover, because they are
 * practical rather than editorial.
 */
const PRACTICAL: ChatAnswer[] = [
  {
    question: "Where are you, and when are you open?",
    answer:
      `The studio is at ${ATELIER_ADDRESS}. We see clients ${ATELIER.hours}. Consultations are by appointment so that someone who knows the work is free for you.`,
    also: ["address", "located", "location", "open", "timing", "timings", "hours", "visit", "studio", "delhi", "store", "shop", "chanakyapuri", "santushti", "reach", "directions"],
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Through the appointment page — tell us the occasion and your date and the atelier will confirm a slot within two working days.",
    also: ["book", "booking", "appointment", "consultation", "fitting", "meet", "slot"],
  },
  {
    question: "What do pieces cost?",
    answer:
      "Prices are on each piece, and a commission is quoted after the first consultation — it depends on the embroidery density and the fabric, so a figure given before we have talked would be a guess.",
    also: ["price", "cost", "how much", "budget", "expensive", "rate", "charges"],
  },
];

/** Words too common to carry meaning when matching. */
const STOP = new Set(
  "a an and are as at be by can could do does for from have how i if in is it me my of on or our should the to us we what when where which will with you your please tell".split(
    " ",
  ),
);

const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

export function knowledgeBase(): ChatAnswer[] {
  return [...fromFaqPage(), ...PRACTICAL];
}

/**
 * Best matching answer, or `null` when nothing is close enough.
 *
 * Deliberately conservative: a boutique answering a bridal client would
 * rather say "write to us" than confidently answer a question it did not
 * actually understand. `null` is what triggers the contact fallback.
 */
export function findAnswer(input: string, kb = knowledgeBase()): ChatAnswer | null {
  const words = normalise(input).filter((w) => w.length > 2 && !STOP.has(w));
  if (words.length === 0) return null;

  let best: { entry: ChatAnswer; score: number } | null = null;

  for (const entry of kb) {
    const haystack = new Set([
      ...normalise(entry.question),
      ...(entry.also ?? []).flatMap((w) => normalise(w)),
    ]);
    let score = 0;
    for (const w of words) {
      if (haystack.has(w)) score += 2;
      // Catch "shipping" against "ship", "fittings" against "fitting".
      else if ([...haystack].some((h) => h.length > 3 && (h.startsWith(w) || w.startsWith(h)))) {
        score += 1;
      }
    }
    if (!best || score > best.score) best = { entry, score };
  }

  // Two matched words, or one strong one -- below that it is a guess.
  return best && best.score >= 2 ? best.entry : null;
}
