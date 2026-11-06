import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/** Strip the light markup used in exam text ({a/b}, ^{n}, **bold**, [img:...]) before reading aloud. */
const plain = (t: string) => t.replace(/\[[^\]]*\]/g, " ").replace(/[{}*_^]/g, "").replace(/\s+/g, " ").trim();

/** Speaker button that reads English text aloud with the device's own voice (free, offline-capable). */
export function Speak({ text }: { text: string }) {
  const [on, setOn] = useState(false);
  const [slow, setSlow] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(typeof window !== "undefined" && "speechSynthesis" in window); return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }; }, []);
  if (!ok) return null;
  const play = (rate: number) => {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(plain(text));
    u.lang = "en-US"; u.rate = rate;
    const v = s.getVoices().find((x) => x.lang.startsWith("en-US")) ?? s.getVoices().find((x) => x.lang.startsWith("en"));
    if (v) u.voice = v;
    u.onend = () => setOn(false); u.onerror = () => setOn(false);
    setOn(true); s.speak(u);
  };
  return (
    <span className="float-right ml-2 inline-flex items-center gap-1">
      <button type="button" aria-label={on ? "หยุดเสียงอ่าน" : "ฟังเสียงอ่าน"} onClick={() => (on ? (window.speechSynthesis.cancel(), setOn(false)) : play(slow ? 0.7 : 1))}
        className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm", on && "bg-primary text-primary-foreground")}>
        {on ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <button type="button" onClick={() => setSlow(!slow)} className={cn("rounded-full border border-border px-2 py-0.5 text-[11px]", slow ? "bg-secondary font-semibold" : "bg-card text-muted-foreground")}>
        {slow ? "ช้า" : "ปกติ"}
      </button>
    </span>
  );
}
