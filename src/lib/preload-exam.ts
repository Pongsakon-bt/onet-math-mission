import { catalog } from "@/data/catalog";

const done = new Map<string, Promise<void>>();

/** Download every diagram of an exam ahead of time (browser only). Resolves when all are cached or after timeoutMs. */
export function preloadExamImages(key: string, timeoutMs = 4000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const exam = catalog[key];
  if (!exam) return Promise.resolve();
  const urls = exam.questions.flatMap((q) => (q.figure?.kind === "image" ? [q.figure.src] : []));
  const all = urls.map((src) => {
    let p = done.get(src);
    if (!p) {
      p = new Promise<void>((res) => {
        const img = new Image();
        img.onload = img.onerror = () => res();
        img.src = src;
      });
      done.set(src, p);
    }
    return p;
  });
  return Promise.race([Promise.all(all).then(() => {}), new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}
