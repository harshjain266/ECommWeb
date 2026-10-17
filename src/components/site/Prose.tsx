import { Reveal } from "@/components/ui/Reveal";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

/** Long-form editorial content, set to the house typography. */
export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="shell max-w-3xl py-16 lg:py-24">
      {blocks.map((block, i) => (
        <Reveal key={i} delay={Math.min(i, 8) * 0.04}>
          {block.kind === "h" && (
            <h2 className="display mt-14 text-[clamp(1.7rem,3.5vw,2.4rem)] text-ink first:mt-0">
              {block.text}
            </h2>
          )}

          {block.kind === "p" && (
            <p className="mt-5 text-pretty font-sans text-[15px] leading-[1.85] text-ink-mute">
              {block.text}
            </p>
          )}

          {block.kind === "list" && (
            <ul className="mt-6 space-y-3">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 font-sans text-[15px] leading-[1.75] text-ink-mute"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 bg-gold" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {block.kind === "table" && (
            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse">
                <thead>
                  <tr>
                    {block.head.map((h) => (
                      <th
                        key={h}
                        className="label border-b border-ink/20 px-3 py-3 text-left text-ink-mute"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border-b border-ink/[0.07] px-3 py-3 font-sans text-[13px] text-ink-mute"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>
      ))}
    </div>
  );
}
