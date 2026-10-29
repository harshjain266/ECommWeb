const NOTES = [
  "Complimentary shipping across India",
  "Made to measure in our Delhi atelier",
  "Appointments open for the 2026 season",
  "Three fittings included on every commission",
];

/**
 * The announcement ticker. The list is rendered twice and translated -50%,
 * which is what makes the loop seamless.
 */
export function Marquee() {
  const strip = [...NOTES, ...NOTES];

  return (
    <div className="relative overflow-hidden border-b border-bone/10 bg-ink py-2.5">
      <div className="flex w-max animate-marquee items-center gap-14 pr-14">
        {strip.map((note, i) => (
          <span
            key={i}
            className="label flex shrink-0 items-center gap-14 text-bone/55"
          >
            {note}
            <span className="text-gold/60" aria-hidden>
              &#9671;
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
