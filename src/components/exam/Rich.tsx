import { Fragment, type ReactNode } from "react";

/** Renders the small markup used in exam text: {a/b}, ^{n}, √{x}, ∛{x}, newlines. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {parse(line)}
        </Fragment>
      ))}
    </>
  );
}

function parse(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(√|∛|\^|_)?\{([^{}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const op = m[1];
    const body = m[2] ?? "";
    if (op === "^") out.push(<sup key={k++}>{body}</sup>);
    else if (op === "_") out.push(<u key={k++} className="underline-offset-4">{body}</u>);
    else if (op === "√" || op === "∛")
      out.push(
        <span key={k++} className="inline-flex items-baseline whitespace-nowrap">
          {op === "∛" ? (
            <span className="relative">
              <sup className="absolute -left-0.5 -top-1 text-[0.6em]">3</sup>√
            </span>
          ) : (
            "√"
          )}
          <span className="border-t border-current px-0.5">{body}</span>
        </span>,
      );
    else {
      const [n, d] = body.split("/");
      out.push(
        <span key={k++} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.85em] leading-tight">
          <span className="border-b border-current px-0.5">{n}</span>
          <span className="px-0.5">{d}</span>
        </span>,
      );
    }
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
